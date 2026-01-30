/**
 * API Route Template
 *
 * Copy this file to create a new CRUD endpoint.
 * Replace 'entity' with your resource name (users, organisations, etc.)
 *
 * Collection routes: src/app/api/entities/route.ts (GET all, POST create)
 * Item routes: src/app/api/entities/[id]/route.ts (GET one, PATCH, DELETE)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { entities } from '@/db/schema'; // Replace with your table
import { eq, ilike, or, sql } from 'drizzle-orm';
import { createEntitySchema, updateEntitySchema } from '@/lib/validations/entity'; // Replace

// ========== COLLECTION ROUTES (route.ts) ==========

/**
 * GET /api/entities
 * List entities with pagination and search
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const search = searchParams.get('search') || undefined;

  // Sanitize and validate pagination params
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 100); // Max 100 items per page
  const offset = (safePage - 1) * safeLimit;

  try {
    // Build search condition (customize fields for your entity)
    const searchCondition = search
      ? or(
          ilike(entities.name, `%${search}%`),
          ilike(entities.email, `%${search}%`) // Replace with your searchable fields
        )
      : undefined;

    // Build queries conditionally (Drizzle type safety requirement)
    const itemsQuery = searchCondition
      ? db.select().from(entities).where(searchCondition).limit(safeLimit).offset(offset)
      : db.select().from(entities).limit(safeLimit).offset(offset);

    const countQuery = searchCondition
      ? db
          .select({ count: sql<number>`count(*)` })
          .from(entities)
          .where(searchCondition)
      : db.select({ count: sql<number>`count(*)` }).from(entities);

    // Execute queries in parallel
    const [items, countResult] = await Promise.all([itemsQuery, countQuery]);

    // Calculate pagination metadata
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
    console.error('Failed to fetch entities:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch entities' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/entities
 * Create a new entity
 */
export async function POST(request: NextRequest) {
  let body;

  // Parse JSON body
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON in request body' },
      { status: 400 }
    );
  }

  // Validate with Zod
  const validationResult = createEntitySchema.safeParse(body);
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
  try {
    const [newEntity] = await db.insert(entities).values(validationResult.data).returning();

    return NextResponse.json({ success: true, data: newEntity }, { status: 201 });
  } catch (error) {
    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return NextResponse.json(
        { success: false, error: 'Entity with this identifier already exists' },
        { status: 409 }
      );
    }

    console.error('Failed to create entity:', error);
    return NextResponse.json({ success: false, error: 'Failed to create entity' }, { status: 500 });
  }
}

// ========== ITEM ROUTES ([id]/route.ts) ==========

/**
 * GET /api/entities/[id]
 * Get a single entity by ID
 */
export async function GET_ONE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // MUST await in Next.js 16

  try {
    const items = await db.select().from(entities).where(eq(entities.id, id)).limit(1);

    if (items.length === 0) {
      return NextResponse.json({ success: false, error: 'Entity not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: items[0],
    });
  } catch (error) {
    console.error('Failed to fetch entity:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch entity' }, { status: 500 });
  }
}

/**
 * PATCH /api/entities/[id]
 * Update an entity
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let body;

  // Parse JSON body
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON in request body' },
      { status: 400 }
    );
  }

  // Validate with Zod
  const validationResult = updateEntitySchema.safeParse(body);
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

  // Check if entity exists
  try {
    const existing = await db.select().from(entities).where(eq(entities.id, id)).limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: 'Entity not found' }, { status: 404 });
    }

    // Update entity
    const [updated] = await db
      .update(entities)
      .set({
        ...validationResult.data,
        updatedAt: new Date(),
      })
      .where(eq(entities.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return NextResponse.json(
        { success: false, error: 'Entity with this identifier already exists' },
        { status: 409 }
      );
    }

    console.error('Failed to update entity:', error);
    return NextResponse.json({ success: false, error: 'Failed to update entity' }, { status: 500 });
  }
}

/**
 * DELETE /api/entities/[id]
 * Delete an entity
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Check if entity exists
    const existing = await db.select().from(entities).where(eq(entities.id, id)).limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: 'Entity not found' }, { status: 404 });
    }

    // Delete entity
    await db.delete(entities).where(eq(entities.id, id));

    return NextResponse.json({
      success: true,
      message: 'Entity deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete entity:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete entity' }, { status: 500 });
  }
}

// ========== CHECKLIST ==========
/*
When using this template:

1. File Structure:
   - Collection: src/app/api/entities/route.ts (GET, POST)
   - Item: src/app/api/entities/[id]/route.ts (GET, PATCH, DELETE)

2. Imports to Replace:
   - entities -> your table name (users, organisations, etc.)
   - createEntitySchema -> your create schema
   - updateEntitySchema -> your update schema

3. Search Condition:
   - Update searchCondition to search relevant fields
   - Example for users: name, email
   - Example for organisations: name, slug

4. Response Messages:
   - Replace "entity" with your resource name in error messages
   - Example: "User not found", "Organisation already exists"

5. Validation:
   - Create Zod schemas in src/lib/validations/entity.ts
   - Export CreateEntityInput and UpdateEntityInput types

6. Tests:
   - Create src/lib/api/entity.test.ts for service layer tests
   - Mock fetch and test all CRUD operations
   - Test validation errors, not found errors, duplicate errors

7. Item Routes Only:
   - Rename GET_ONE to GET in [id]/route.ts
   - Only export GET, PATCH, DELETE in item routes

8. Database Schema:
   - Ensure your table has id, createdAt, updatedAt fields
   - Add indexes for searchable fields
   - Set up foreign key constraints if needed

9. Error Handling:
   - Log errors with console.error
   - Return appropriate status codes
   - Include validation details for 400 errors
   - Use generic messages for 500 errors

10. Pagination:
    - Default: page=1, limit=50
    - Max limit: 100 items per page
    - Include total count and pages in response
*/
