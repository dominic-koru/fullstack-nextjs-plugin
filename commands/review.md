# Review Command

Review recent changes for potential issues, improvements, and adherence to project conventions.

## Usage

```
/review [scope]
```

**Scopes:**

- `/review` - Review recent changes (last commit or uncommitted changes)
- `/review all` - Review entire codebase for patterns and issues
- `/review <file>` - Review a specific file

## What This Command Does

1. **Identifies changes** to review
2. **Checks against CLAUDE.md conventions**
3. **Looks for common issues**:
   - Next.js 16 async params pattern violations
   - Missing Zod validation
   - Inconsistent API response formats
   - Missing error handling
   - Type safety issues
   - Unused imports
   - Console.log statements left in code
4. **Suggests improvements**
5. **Checks for missing tests**

## Instructions for Claude

When the user runs `/review [scope]`, follow these steps:

### Step 1: Identify What to Review

```bash
# Get recently changed files
git diff --name-only HEAD~1

# Or get uncommitted changes
git diff --name-only

# Or get staged changes
git diff --cached --name-only
```

Filter to only source files (exclude node_modules, build artifacts, etc.)

### Step 2: Read and Analyze

For each file:

1. **Read the file content**
2. **Check against CLAUDE.md patterns**:
   - API routes use correct response format?
   - Dynamic routes use `await params`?
   - Validation uses Zod?
   - Components follow MUI patterns?
   - Service layer used for API calls?
   - TypeScript types properly defined?

3. **Check for common issues**:
   - Security vulnerabilities (SQL injection, XSS, etc.)
   - Missing error handling
   - Inconsistent naming
   - Magic numbers or strings
   - Code duplication
   - Performance issues
   - Accessibility issues in UI components

### Step 3: Check for Missing Tests

For each changed file, check if corresponding test file exists:

- `src/lib/api/organisations.ts` → `src/lib/api/organisations.test.ts`
- `src/components/X.tsx` → `src/components/X.test.tsx`

### Step 4: Report Findings

Format the report clearly:

```markdown
## Code Review Report

**Files Reviewed**: X files
**Issues Found**: X

### ✅ Following Conventions

- ✓ All API routes use consistent response format
- ✓ Next.js 16 async params pattern used correctly
- ✓ Zod validation in place

### ⚠️ Issues & Suggestions

#### src/app/api/organisations/route.ts

**Issue**: Missing error handling for database connection failure

- **Line**: 12
- **Severity**: Medium
- **Suggestion**: Wrap database calls in try-catch and return appropriate error response

**Issue**: Console.log left in production code

- **Line**: 34
- **Severity**: Low
- **Suggestion**: Remove or replace with proper logging

#### src/components/organisations/OrganisationDialog.tsx

**Issue**: Missing loading state for form submission

- **Line**: 45
- **Severity**: Low
- **Suggestion**: Disable form inputs while loading is true

### 🧪 Missing Tests

The following files have no corresponding test files:

- src/lib/api/organisations.ts
- src/components/organisations/OrganisationDialog.tsx

### 📊 Summary

**Severity Breakdown**:

- High: 0
- Medium: 1
- Low: 2

**Recommendations**:

1. Add error handling for database operations
2. Remove console.log statements
3. Create test files for untested code

Would you like me to fix any of these issues?
```

### Step 5: Offer Fixes

If issues are found:

1. Prioritize by severity
2. Offer to fix them automatically
3. Explain what each fix will do

## Specific Checks

### API Routes

- ✓ Uses `await params` for dynamic routes (Next.js 16)
- ✓ Consistent response format: `{ success, data?, error? }`
- ✓ Zod validation with `safeParse`
- ✓ Proper HTTP status codes
- ✓ Error handling with try-catch
- ✓ Database queries use parameterized queries (no SQL injection)
- ✓ No sensitive data in error responses

### Components

- ✓ Uses 'use client' directive when needed
- ✓ MUI components used correctly
- ✓ Loading states implemented
- ✓ Error states handled
- ✓ Accessibility attributes (aria-label, etc.)
- ✓ Form validation
- ✓ No inline styles (use sx prop or theme)

### Redux

- ✓ Uses typed hooks (useAppSelector, useAppDispatch)
- ✓ Actions follow naming conventions
- ✓ No direct state mutation
- ✓ Selectors used appropriately

### TypeScript

- ✓ No `any` types
- ✓ Proper type imports
- ✓ Types exported where needed
- ✓ No unused variables
- ✓ No @ts-ignore comments without explanation

### General

- ✓ No console.log in production code
- ✓ No hardcoded secrets or credentials
- ✓ Consistent naming conventions
- ✓ No TODO comments without tickets
- ✓ Imports organized (React, next, third-party, local)

## Example Usage

```
User: /review

Claude:
Reviewing recent changes...

[Reads git diff, analyzes files]

## Code Review Report

**Files Reviewed**: 3 files
**Issues Found**: 2

### ✅ Following Conventions

- ✓ All API routes use Next.js 16 async params pattern
- ✓ Consistent API response format
- ✓ Zod validation schemas properly defined
- ✓ TypeScript strict mode compliance

### ⚠️ Issues & Suggestions

#### src/app/api/organisations/[id]/route.ts

**Issue**: Potential race condition in slug uniqueness check
- **Line**: 85-90
- **Severity**: Medium
- **Suggestion**: Add database unique constraint or transaction

### 🧪 Missing Tests

All modified files have corresponding tests. Great job! ✅

### 📊 Summary

Overall code quality is good. One medium-severity issue to address.

Would you like me to add the database constraint for slug uniqueness?
```

## Notes

- Focus on actionable feedback
- Prioritize security and correctness issues
- Be constructive, not critical
- Reference CLAUDE.md patterns
- Offer to fix issues when possible
- Consider the context of the change
