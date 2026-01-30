# Validation Patterns with Zod

Zod schema patterns for validating API inputs in this project.

---

## Core Principles

1. **Separate create and update schemas** - Create requires all fields, update allows partial
2. **Strict validation** - Reject unknown fields
3. **Type inference** - Export TypeScript types from schemas
4. **Descriptive errors** - Custom error messages for better UX
5. **Reusable schemas** - Compose common patterns

---

## Schema File Structure

```typescript
// src/lib/validations/entity.ts
import { z } from 'zod';

// Create schema - all fields required
export const createEntitySchema = z.object({
  // Field definitions...
});

// Update schema - all fields optional
export const updateEntitySchema = z.object({
  // Same fields but optional...
});

// Export inferred types
export type CreateEntityInput = z.infer<typeof createEntitySchema>;
export type UpdateEntityInput = z.infer<typeof updateEntitySchema>;
```

---

## Common Field Patterns

### String Fields

**Required string:**

```typescript
name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
```

**Optional string:**

```typescript
name: z.string().min(1).max(255).optional(),
```

**Email:**

```typescript
email: z.string().email('Invalid email address').max(255),
```

**Slug (lowercase, numbers, hyphens):**

```typescript
slug: z
  .string()
  .min(1, 'Slug is required')
  .max(255, 'Slug too long')
  .regex(/^[a-z0-9-]+$/, 'Must contain only lowercase letters, numbers, and hyphens'),
```

**URL:**

```typescript
website: z.string().url('Invalid URL').optional(),
```

**Enum (role):**

```typescript
role: z.enum(['owner', 'admin', 'member'], {
  errorMap: () => ({ message: 'Role must be owner, admin, or member' }),
}),
```

### UUID Fields

```typescript
id: z.string().uuid('Invalid ID format'),
```

### Number Fields

**Integer:**

```typescript
age: z.number().int().min(0).max(120),
```

**Positive number:**

```typescript
price: z.number().positive('Price must be positive'),
```

### Boolean Fields

```typescript
isActive: z.boolean().default(true),
```

### Date Fields

```typescript
birthDate: z.coerce.date(), // Accepts string or Date, converts to Date
```

---

## Example: User Validation Schema

```typescript
// src/lib/validations/user.ts
import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  email: z.string().email('Invalid email address').max(255, 'Email is too long'),
});

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long').optional(),
  email: z.string().email('Invalid email address').max(255, 'Email is too long').optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
```

---

## Example: Organisation Validation Schema

```typescript
// src/lib/validations/organisation.ts
import { z } from 'zod';

export const createOrganisationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(255, 'Slug is too long')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
});

export const updateOrganisationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long').optional(),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(255, 'Slug is too long')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional(),
});

export type CreateOrganisationInput = z.infer<typeof createOrganisationSchema>;
export type UpdateOrganisationInput = z.infer<typeof updateOrganisationSchema>;
```

---

## Example: Organisation-User (Membership) Schema

```typescript
// src/lib/validations/organisation-user.ts
import { z } from 'zod';

export const addUserToOrganisationSchema = z.object({
  organisationId: z.string().uuid('Invalid organisation ID'),
  userId: z.string().uuid('Invalid user ID'),
  role: z.enum(['owner', 'admin', 'member'], {
    errorMap: () => ({ message: 'Role must be owner, admin, or member' }),
  }),
});

export const updateOrganisationUserRoleSchema = z.object({
  role: z.enum(['owner', 'admin', 'member'], {
    errorMap: () => ({ message: 'Role must be owner, admin, or member' }),
  }),
});

export type AddUserToOrganisationInput = z.infer<typeof addUserToOrganisationSchema>;
export type UpdateOrganisationUserRoleInput = z.infer<typeof updateOrganisationUserRoleSchema>;
```

---

## Using Schemas in API Routes

### 1. Import the schema

```typescript
import { createUserSchema, updateUserSchema } from '@/lib/validations/user';
```

### 2. Parse and validate

```typescript
const validationResult = createUserSchema.safeParse(body);
```

### 3. Check for errors

```typescript
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
```

### 4. Use validated data

```typescript
// validationResult.data is fully typed!
const validated = validationResult.data;

const [newUser] = await db.insert(users).values(validated).returning();
```

---

## Validation Error Format

Zod's `error.format()` returns structured errors:

**Input:**

```json
{
  "name": "",
  "email": "invalid-email"
}
```

**Validation Result:**

```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "name": {
      "_errors": ["Name is required"]
    },
    "email": {
      "_errors": ["Invalid email address"]
    }
  }
}
```

---

## Advanced Patterns

### Nested Objects

```typescript
const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  postalCode: z.string().min(1),
});

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  address: addressSchema, // Nested schema
});
```

### Arrays

```typescript
const createOrganisationSchema = z.object({
  name: z.string().min(1),
  tags: z.array(z.string()).min(1, 'At least one tag required').max(10, 'Maximum 10 tags'),
});
```

### Conditional Validation

```typescript
const createUserSchema = z
  .object({
    role: z.enum(['admin', 'user']),
    permissions: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      // Admins must have permissions
      if (data.role === 'admin' && (!data.permissions || data.permissions.length === 0)) {
        return false;
      }
      return true;
    },
    {
      message: 'Admins must have at least one permission',
      path: ['permissions'],
    }
  );
```

### Transformations

```typescript
const createOrganisationSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .transform((val) => val.toLowerCase()) // Auto-lowercase
    .pipe(z.string().regex(/^[a-z0-9-]+$/)),
});
```

### Optional with Default

```typescript
const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  isActive: z.boolean().default(true), // Default value
  role: z.enum(['owner', 'admin', 'member']).default('member'), // Default enum
});
```

### Strict Mode (Reject Unknown Fields)

```typescript
const createUserSchema = z
  .object({
    name: z.string().min(1),
    email: z.string().email(),
  })
  .strict(); // Reject any fields not in the schema
```

---

## Testing Validation Schemas

```typescript
// src/lib/validations/user.test.ts
import { describe, it, expect } from 'vitest';
import { createUserSchema, updateUserSchema } from './user';

describe('createUserSchema', () => {
  it('should validate valid user data', () => {
    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
    };

    const result = createUserSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject empty name', () => {
    const invalidData = {
      name: '',
      email: 'john@example.com',
    };

    const result = createUserSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.format().name?._errors).toContain('Name is required');
    }
  });

  it('should reject invalid email', () => {
    const invalidData = {
      name: 'John Doe',
      email: 'not-an-email',
    };

    const result = createUserSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.format().email?._errors).toContain('Invalid email address');
    }
  });

  it('should reject name longer than 255 characters', () => {
    const invalidData = {
      name: 'a'.repeat(256),
      email: 'john@example.com',
    };

    const result = createUserSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.format().name?._errors).toContain('Name is too long');
    }
  });
});

describe('updateUserSchema', () => {
  it('should allow partial updates', () => {
    const validData = {
      name: 'John Doe',
    };

    const result = updateUserSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should allow empty object (no updates)', () => {
    const result = updateUserSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should reject invalid email in partial update', () => {
    const invalidData = {
      email: 'not-an-email',
    };

    const result = updateUserSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
```

---

## Validation Best Practices

1. **Always use `safeParse`**, never `parse` (throws errors)
2. **Provide custom error messages** for better UX
3. **Keep schemas close to route handlers** (co-location)
4. **Export TypeScript types** from schemas using `z.infer`
5. **Test validation edge cases** (empty strings, max lengths, invalid formats)
6. **Use strict mode** to reject unknown fields
7. **Validate before database operations**, never trust client input
8. **Return structured validation errors** with `error.format()`
9. **Reuse common patterns** (email, UUID, slug)
10. **Document required vs optional fields** in schema comments

---

## Common Validation Errors to Test

For every schema, test:

- ✅ Valid data passes
- ❌ Empty required fields rejected
- ❌ Invalid email format rejected
- ❌ Strings exceeding max length rejected
- ❌ Invalid enum values rejected
- ❌ Invalid UUID format rejected
- ❌ Regex pattern violations rejected
- ✅ Optional fields can be omitted
- ✅ Update schemas accept partial data
- ❌ Unknown fields rejected (if using strict mode)

---

## Checklist for New Validation Schema

- [ ] Create separate create and update schemas
- [ ] Add custom error messages for all fields
- [ ] Use appropriate Zod types (string, number, email, uuid, enum)
- [ ] Set min/max constraints
- [ ] Add regex validation where needed (slug, phone, etc.)
- [ ] Export TypeScript types with `z.infer`
- [ ] Write comprehensive tests
- [ ] Document required vs optional fields
- [ ] Use strict mode if needed
- [ ] Handle nested objects if needed
