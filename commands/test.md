# Test Command

Run tests for recent changes and report results in a consistent format.

## Usage

```
/test [scope]
```

**Scopes:**

- `/test` - Run all tests
- `/test unit` - Run only unit tests
- `/test api` - Run API-related tests
- `/test components` - Run component tests
- `/test <filename>` - Run tests for a specific file

## What This Command Does

1. **Analyzes recent changes** to determine what should be tested
2. **Runs appropriate tests** using Vitest
3. **Reports results** in a consistent, readable format
4. **Suggests fixes** if tests fail
5. **Verifies build** if requested

## Instructions for Claude

When the user runs `/test [scope]`, follow these steps:

### Step 1: Determine Test Scope

1. If scope is provided, use it
2. If no scope, check recent file changes:
   - Use `Bash` to run `git diff --name-only HEAD~1` or similar
   - Determine which test suites are relevant
   - Default to running all tests if unsure

### Step 2: Run Tests

Use the appropriate npm script:

```bash
# All tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- src/lib/api/organisations.test.ts

# Run tests matching pattern
npm test -- organisations
```

### Step 3: Analyze Results

Parse the test output and identify:

- Total tests run
- Passed tests
- Failed tests
- Test execution time
- Coverage metrics (if available)

### Step 4: Report Results

Format the output in a clear, consistent format:

```markdown
## Test Results

**Status**: ✅ All tests passed | ❌ X tests failed

**Summary**:

- Total: X tests
- Passed: X tests
- Failed: X tests
- Duration: Xs

### Failed Tests (if any):

**Test Suite**: path/to/test/file.test.ts

- ❌ Test name
  - Expected: ...
  - Received: ...
  - Location: file.ts:line

### Coverage (if run):

- Statements: X%
- Branches: X%
- Functions: X%
- Lines: X%
```

### Step 5: Provide Recommendations

If tests failed:

1. Analyze the failure
2. Suggest potential fixes
3. Offer to implement the fix if it's straightforward

If no tests exist for recent changes:

1. Point out which files lack tests
2. Suggest what should be tested
3. Offer to create tests

## Additional Checks

Also perform these checks:

1. **TypeScript Compilation**:

   ```bash
   npx tsc --noEmit
   ```

2. **Linting** (if requested):

   ```bash
   npm run lint
   ```

3. **Build Verification** (if requested):
   ```bash
   npm run build
   ```

## Example Usage

```
User: /test

Claude:
Running all tests...

[Executes: npm test]

## Test Results

**Status**: ✅ All tests passed

**Summary**:
- Total: 24 tests
- Passed: 24 tests
- Failed: 0 tests
- Duration: 3.2s

**Test Suites**:
✅ src/lib/api/organisations.test.ts (8 tests)
✅ src/components/organisations/OrganisationDialog.test.tsx (6 tests)
✅ src/lib/validations/organisation.test.ts (10 tests)

All tests are passing! 🎉
```

```
User: /test api

Claude:
Running API tests...

[Executes: npm test -- api]

## Test Results

**Status**: ❌ 2 tests failed

**Summary**:
- Total: 8 tests
- Passed: 6 tests
- Failed: 2 tests
- Duration: 1.8s

### Failed Tests:

**Test Suite**: src/app/api/organisations/[id]/route.test.ts
- ❌ DELETE /api/organisations/[id] should return 404 for non-existent org
  - Expected status: 404
  - Received status: 500
  - Location: route.test.ts:45

- ❌ PATCH /api/organisations/[id] should validate slug format
  - Expected error message to contain "lowercase"
  - Received: "Validation failed"
  - Location: route.test.ts:67

### Recommendations:

1. **DELETE route**: The 404 check might be missing. Verify the existence check before deletion in src/app/api/organisations/[id]/route.ts:132

2. **PATCH validation**: The error message needs to include the detailed validation error. Check the Zod schema error formatting.

Would you like me to fix these issues?
```

## Notes

- Always run tests before reporting success
- Parse test output carefully to extract meaningful information
- Provide context for failures
- Suggest fixes when possible
- If tests are missing, offer to create them
- Check both unit tests and build status for comprehensive verification
- Use emoji indicators for quick visual scanning (✅ ❌)
