# Next.js 16 API Route Skill

**Purpose**: Provide expertise for creating and maintaining Next.js 16 API route handlers following project conventions.

**When to Apply**: When creating or modifying files in `src/app/api/**/*`.

---

## Core Principles

1. **Type Safety First**: All inputs and outputs fully typed
2. **Consistent Response Format**: Standard `ApiResponse<T>` wrapper
3. **Validation Before Logic**: Zod schemas validate all inputs
4. **Async Params**: Next.js 16 requires awaiting route params
5. **Error Handling**: Structured error responses with appropriate status codes
6. **Database Queries**: Use Drizzle ORM with conditional query building

---

## Next.js 16 Critical Changes

### Async Route Parameters (BREAKING CHANGE)

In Next.js 16, route parameters are **Promises** and MUST be awaited:

```typescript
// ❌ WRONG (Next.js 15)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id; // Runtime error!
}

// ✅ CORRECT (Next.js 16)
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // Must await
  // ... rest of logic
}
```

### URLSearchParams for Query Parameters

```typescript
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const search = searchParams.get('search') || undefined;

  // Sanitize and validate
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 100);

  // Use in query...
}
```

---

## Standard Response Format

All API routes return this consistent structure:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown; // For validation errors
  pagination?: PaginationMetadata; // For list endpoints
}

interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
```

### Success Response

```typescript
return NextResponse.json({
  success: true,
  data: result,
});
```

### Error Response

```typescript
return NextResponse.json(
  {
    success: false,
    error: 'Human-readable error message',
  },
  { status: 400 } // Appropriate HTTP status
);
```

### Validation Error Response

```typescript
return NextResponse.json(
  {
    success: false,
    error: 'Validation failed',
    details: validationResult.error.format(), // Zod formatted errors
  },
  { status: 400 }
);
```

---

## CRUD Route Patterns

### Collection Routes (`route.ts`)

**GET all with pagination:**

```typescript
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const search = searchParams.get('search') || undefined;

  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 100);
  const offset = (safePage - 1) * safeLimit;

  try {
    // Build search condition
    const searchCondition = search
      ? or(ilike(table.name, `%${search}%`), ilike(table.email, `%${search}%`))
      : undefined;

    // Build queries conditionally (Drizzle type safety)
    const itemsQuery = searchCondition
      ? db.select().from(table).where(searchCondition).limit(safeLimit).offset(offset)
      : db.select().from(table).limit(safeLimit).offset(offset);

    const countQuery = searchCondition
      ? db
          .select({ count: sql<number>`count(*)` })
          .from(table)
          .where(searchCondition)
      : db.select({ count: sql<number>`count(*)` }).from(table);

    const [items, countResult] = await Promise.all([itemsQuery, countQuery]);

    const total = Number(countResult[0].count);
    const pages = Math.ceil(total / safeLimit);

    return NextResponse.json({
      success: true,
      data: items,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        pages,
      },
    });
  } catch (error) {
    console.error('Failed to fetch items:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch items' }, { status: 500 });
  }
}
```

**POST create:**

```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate with Zod
    const validationResult = createSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    // Insert into database
    const [newItem] = await db.insert(table).values(validationResult.data).returning();

    return NextResponse.json({ success: true, data: newItem }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return NextResponse.json(
        { success: false, error: 'Item with this identifier already exists' },
        { status: 409 }
      );
    }

    console.error('Failed to create item:', error);
    return NextResponse.json({ success: false, error: 'Failed to create item' }, { status: 500 });
  }
}
```

### Item Routes (`[id]/route.ts`)

**GET one:**

```typescript
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // MUST await in Next.js 16

  try {
    const items = await db.select().from(table).where(eq(table.id, id)).limit(1);

    if (items.length === 0) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: items[0],
    });
  } catch (error) {
    console.error('Failed to fetch item:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch item' }, { status: 500 });
  }
}
```

**PATCH update:**

```typescript
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const body = await request.json();

    // Validate with Zod
    const validationResult = updateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    // Check existence first
    const existing = await db.select().from(table).where(eq(table.id, id)).limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    // Update
    const [updated] = await db
      .update(table)
      .set({
        ...validationResult.data,
        updatedAt: new Date(),
      })
      .where(eq(table.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return NextResponse.json(
        { success: false, error: 'Item with this identifier already exists' },
        { status: 409 }
      );
    }

    console.error('Failed to update item:', error);
    return NextResponse.json({ success: false, error: 'Failed to update item' }, { status: 500 });
  }
}
```

**DELETE:**

```typescript
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Check existence first
    const existing = await db.select().from(table).where(eq(table.id, id)).limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    // Delete
    await db.delete(table).where(eq(table.id, id));

    return NextResponse.json({
      success: true,
      message: 'Item deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete item:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete item' }, { status: 500 });
  }
}
```

---

## Drizzle ORM Query Building

### Conditional Queries (Critical for Type Safety)

Drizzle's type system doesn't support reassigning query variables. Build queries conditionally:

```typescript
// ❌ WRONG - Type error
let query = db.select().from(users);
if (search) {
  query = query.where(searchCondition); // Type information lost!
}

// ✅ CORRECT - Conditional building
const searchCondition = search
  ? or(ilike(users.name, `%${search}%`), ilike(users.email, `%${search}%`))
  : undefined;

const query = searchCondition
  ? db.select().from(users).where(searchCondition).limit(limit).offset(offset)
  : db.select().from(users).limit(limit).offset(offset);
```

### Counting with Pagination

```typescript
import { sql } from 'drizzle-orm';

const countQuery = db.select({ count: sql<number>`count(*)` }).from(table);

const [countResult] = await countQuery;
const total = Number(countResult.count);
```

---

## Validation Patterns

Always validate request bodies with Zod before processing:

```typescript
import { createSchema, updateSchema } from '@/lib/validations/entity';

// Validate
const validationResult = createSchema.safeParse(body);

// Check result
if (!validationResult.success) {
  return NextResponse.json(
    {
      success: false,
      error: 'Validation failed',
      details: validationResult.error.format(),
    },
    { status: 400 }
  );
}

// Use validated data (fully typed!)
const validated = validationResult.data;
```

See `references/validation-patterns.md` for Zod schema patterns.

---

## Error Handling

### HTTP Status Codes

- `200` - Success (GET, PATCH)
- `201` - Created (POST)
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `500` - Internal Server Error

### Error Response Pattern

```typescript
try {
  // ... operation
} catch (error) {
  // Handle specific errors
  if (error instanceof Error && error.message.includes('unique constraint')) {
    return NextResponse.json({ success: false, error: 'Duplicate entry' }, { status: 409 });
  }

  // Log error for debugging
  console.error('Operation failed:', error);

  // Generic error response
  return NextResponse.json({ success: false, error: 'Operation failed' }, { status: 500 });
}
```

See `references/error-handling.md` for comprehensive error patterns.

---

## Imports Checklist

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { table } from '@/db/schema'; // Your table schema
import { eq, ilike, or, sql } from 'drizzle-orm';
import { createSchema, updateSchema } from '@/lib/validations/entity';
```

---

## Testing Requirements

Every API route MUST have corresponding tests:

1. **Service layer tests** (`src/lib/api/*.test.ts`)
   - Mock `global.fetch`
   - Test success and error cases
   - Test pagination parameters
   - Test search functionality

2. **Integration tests** (future)
   - Test actual HTTP requests
   - Test database interactions
   - Test validation edge cases

---

## References

- `references/error-handling.md` - Comprehensive error handling patterns
- `references/validation-patterns.md` - Zod schema patterns
- `assets/route-template.ts` - Starter template for new routes

---

## Common Pitfalls

1. **Forgetting to await params** - Next.js 16 requirement
2. **Reassigning Drizzle queries** - Build conditionally instead
3. **Missing validation** - Always validate inputs
4. **Inconsistent response format** - Use ApiResponse wrapper
5. **Not sanitizing pagination params** - Always validate and cap limits
6. **Missing error logging** - Use console.error for debugging

---

## Quick Reference

**Collection route structure:**

```
src/app/api/entities/
├── route.ts          # GET (list), POST (create)
└── [id]/
    └── route.ts      # GET (one), PATCH (update), DELETE
```

**Typical response time budget:**

- Simple CRUD: < 50ms
- With pagination: < 100ms
- With search: < 200ms

**Database connection:**

- Uses connection pooling via `db` from `@/db`
- No need to manually manage connections
- Drizzle handles query building and execution
