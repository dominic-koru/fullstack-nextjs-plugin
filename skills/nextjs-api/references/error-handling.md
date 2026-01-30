# Error Handling Patterns

Comprehensive error handling patterns for Next.js 16 API routes in this project.

---

## HTTP Status Codes Reference

### Success Codes (2xx)

- **200 OK** - Successful GET, PATCH operations
- **201 Created** - Successful POST operations
- **204 No Content** - Successful DELETE (not used in this project - we return JSON)

### Client Error Codes (4xx)

- **400 Bad Request** - Validation errors, malformed requests
- **404 Not Found** - Resource doesn't exist
- **409 Conflict** - Duplicate entry (unique constraint violations)
- **422 Unprocessable Entity** - Semantic errors (optional, we use 400)

### Server Error Codes (5xx)

- **500 Internal Server Error** - Unexpected errors, database failures

---

## Error Response Structure

All errors follow this structure:

```typescript
interface ErrorResponse {
  success: false;
  error: string; // Human-readable error message
  details?: unknown; // Optional structured details (validation errors)
}
```

---

## Validation Errors (400)

```typescript
import { createSchema } from '@/lib/validations/entity';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

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

    // Continue with validated data...
  } catch (error) {
    // Handle other errors...
  }
}
```

**Example response:**

```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "name": {
      "_errors": ["String must contain at least 1 character(s)"]
    },
    "email": {
      "_errors": ["Invalid email"]
    }
  }
}
```

---

## Not Found Errors (404)

```typescript
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

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
    // Handle database errors...
  }
}
```

---

## Duplicate Entry Errors (409)

Catch unique constraint violations from the database:

```typescript
try {
  const [newItem] = await db.insert(table).values(validationResult.data).returning();

  return NextResponse.json({ success: true, data: newItem }, { status: 201 });
} catch (error) {
  // Check for unique constraint violation
  if (error instanceof Error && error.message.includes('unique constraint')) {
    return NextResponse.json(
      { success: false, error: 'Item with this identifier already exists' },
      { status: 409 }
    );
  }

  // Other errors...
  throw error;
}
```

**Common unique constraint patterns:**

- Email already exists: `"User with this email already exists"`
- Slug already exists: `"Organisation with this slug already exists"`
- Composite key violation: `"User is already a member of this organisation"`

---

## Internal Server Errors (500)

Catch unexpected errors and return generic messages:

```typescript
try {
  // Database operations...
} catch (error) {
  // Log detailed error for debugging
  console.error('Failed to fetch items:', error);

  // Return generic error to client
  return NextResponse.json({ success: false, error: 'Failed to fetch items' }, { status: 500 });
}
```

**Important:**

- ✅ Log full error details server-side (console.error)
- ❌ Don't expose internal error details to client
- ✅ Use generic error messages in responses

---

## Malformed JSON Errors (400)

Handle JSON parsing errors:

```typescript
export async function POST(request: NextRequest) {
  let body;

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON in request body' },
      { status: 400 }
    );
  }

  // Continue with validation...
}
```

---

## Database Connection Errors (500)

Drizzle handles connection errors automatically, but you can catch them:

```typescript
try {
  const items = await db.select().from(table);
  return NextResponse.json({ success: true, data: items });
} catch (error) {
  console.error('Database error:', error);

  if (error instanceof Error && error.message.includes('connection')) {
    return NextResponse.json(
      { success: false, error: 'Database connection failed' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: false, error: 'Failed to fetch items' }, { status: 500 });
}
```

---

## Complete Error Handling Template

```typescript
export async function POST(request: NextRequest) {
  let body;

  // 1. Parse JSON
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON in request body' },
      { status: 400 }
    );
  }

  // 2. Validate input
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

  // 3. Database operations
  try {
    const [newItem] = await db.insert(table).values(validationResult.data).returning();

    return NextResponse.json({ success: true, data: newItem }, { status: 201 });
  } catch (error) {
    // 4. Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('unique constraint')) {
        return NextResponse.json({ success: false, error: 'Item already exists' }, { status: 409 });
      }

      if (error.message.includes('foreign key constraint')) {
        return NextResponse.json(
          { success: false, error: 'Referenced item does not exist' },
          { status: 400 }
        );
      }
    }

    // 5. Catch-all for unexpected errors
    console.error('Failed to create item:', error);
    return NextResponse.json({ success: false, error: 'Failed to create item' }, { status: 500 });
  }
}
```

---

## Error Handling Checklist

When implementing error handling:

- [ ] Parse JSON with try/catch
- [ ] Validate inputs with Zod
- [ ] Check for 404 (item not found)
- [ ] Catch unique constraint violations (409)
- [ ] Catch foreign key constraint violations (400)
- [ ] Log errors server-side with console.error
- [ ] Return generic error messages to client
- [ ] Use appropriate HTTP status codes
- [ ] Include structured details for validation errors
- [ ] Test error scenarios in test suite

---

## Testing Error Scenarios

Every route should have tests for:

1. **Validation errors:**

```typescript
it('should throw error when validation fails', async () => {
  const invalidData = { name: '', email: 'invalid' };
  const mockResponse = {
    success: false,
    error: 'Validation failed',
  };

  mockFetch.mockResolvedValueOnce({
    json: async () => mockResponse,
  });

  await expect(createItem(invalidData)).rejects.toThrow('Validation failed');
});
```

2. **Not found errors:**

```typescript
it('should throw error when item not found', async () => {
  const mockResponse = {
    success: false,
    error: 'Item not found',
  };

  mockFetch.mockResolvedValueOnce({
    json: async () => mockResponse,
  });

  await expect(fetchItem('non-existent-id')).rejects.toThrow('Item not found');
});
```

3. **Duplicate entry errors:**

```typescript
it('should throw error when email already exists', async () => {
  const mockResponse = {
    success: false,
    error: 'User with this email already exists',
  };

  mockFetch.mockResolvedValueOnce({
    json: async () => mockResponse,
  });

  await expect(createUser(duplicateData)).rejects.toThrow('User with this email already exists');
});
```

4. **Network errors:**

```typescript
it('should handle network errors', async () => {
  mockFetch.mockRejectedValueOnce(new Error('Network error'));

  await expect(fetchItems()).rejects.toThrow('Network error');
});
```

---

## Error Logging Best Practices

1. **Always log errors server-side:**

```typescript
console.error('Operation failed:', error);
```

2. **Include context in logs:**

```typescript
console.error(`Failed to create user with email ${email}:`, error);
```

3. **Don't log sensitive data:**

```typescript
// ❌ Bad - logs password
console.error('User creation failed:', { email, password, error });

// ✅ Good - omits sensitive data
console.error('User creation failed:', { email, error: error.message });
```

4. **Use structured logging in production:**

```typescript
// Future: Use a logging library like Winston or Pino
logger.error('User creation failed', {
  operation: 'createUser',
  email,
  error: error.message,
  stack: error.stack,
});
```

---

## Common Error Messages

**Users:**

- "User not found"
- "User with this email already exists"
- "Failed to create user"
- "Failed to update user"
- "Failed to delete user"

**Organisations:**

- "Organisation not found"
- "Organisation with this slug already exists"
- "Failed to create organisation"
- "Failed to update organisation"
- "Failed to delete organisation"

**Organisation-Users (Memberships):**

- "User is already a member of this organisation"
- "Membership not found"
- "Cannot remove the last owner"
- "User does not exist"
- "Organisation does not exist"

**Generic:**

- "Validation failed"
- "Invalid JSON in request body"
- "Database connection failed"
- "Internal server error"
