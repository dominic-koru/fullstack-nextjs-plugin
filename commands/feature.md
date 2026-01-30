# Feature Command

Build a new feature following the project's established conventions and patterns.

## Usage

```
/feature <feature description>
```

## What This Command Does

1. **Reads CLAUDE.md** to understand project conventions and patterns
2. **Creates a plan** before writing any code:
   - Lists all files that need to be created or modified
   - Identifies which patterns from CLAUDE.md apply
   - Plans tests FIRST (TDD approach)
   - Considers Redux state implications
   - Plans API routes if needed (with Next.js 16 async params)
   - Plans UI components using MUI
   - Plans Zod validation schemas if needed
3. **Asks for approval** before implementing
4. **Follows Test-Driven Development (TDD)**:
   - Write tests first (Red phase)
   - Verify tests fail
   - Implement the feature (Green phase)
   - Verify tests pass
   - Refactor if needed (Refactor phase)
5. **Updates CLAUDE.md** if new patterns are discovered

## Instructions for Claude

When the user runs `/feature <description>`, follow these steps:

### Step 1: Understand the Context

1. Read `CLAUDE.md` to understand:
   - Existing API route patterns
   - Validation patterns with Zod
   - MUI component patterns
   - Redux store structure
   - Database schema
   - **Internationalization (i18n) requirements** - ALL user-facing strings must be translated
   - Project conventions

2. Read the existing codebase to understand:
   - Current file structure
   - Similar features that already exist
   - Naming conventions

### Step 2: Create a Plan

Create a detailed plan that includes:

1. **Files to Create/Modify**:
   - List each file with its purpose
   - Use existing patterns from CLAUDE.md

2. **Database Changes** (if needed):
   - Schema changes
   - Migration requirements

3. **API Routes** (if needed):
   - Route paths
   - HTTP methods
   - Request/response types
   - Validation schemas
   - Remember: Next.js 16 requires `await params`

4. **Redux State** (if needed):
   - New slices or modifications to existing slices
   - Actions and reducers
   - Selectors

5. **UI Components**:
   - Page components
   - Reusable components
   - MUI components to use
   - Forms and dialogs

6. **Internationalization (i18n)** - REQUIRED:
   - Create/update translation files in `src/lib/i18n/locales/en/[feature].json`
   - Add all user-facing strings to translation catalog
   - Use `useTranslation` hook in all components
   - NEVER use hardcoded strings

7. **Validation**:
   - Zod schemas needed
   - Where validation occurs (API, client, both)

8. **Testing Strategy** (TDD - Tests First!):
   - What tests to write BEFORE implementing
   - Test file locations (match source file structure)
   - Test cases to cover (happy path, error cases, edge cases)
   - Mock requirements (API calls, database, etc.)

### Step 3: Get Approval

Present the plan to the user using the `AskUserQuestion` tool if there are multiple approaches, or use `EnterPlanMode` if the feature is complex and requires planning.

For simple features, just show the plan as text and ask if they want to proceed.

### Step 4: Implement Using TDD (Red-Green-Refactor)

Once approved, follow Test-Driven Development:

**PHASE 1: RED - Write Failing Tests**

1. Use `TodoWrite` to track implementation tasks
2. **Write tests FIRST** before any implementation code:
   - Create test files (e.g., `feature.test.ts`)
   - Write test cases for expected behavior
   - Include happy path, error cases, and edge cases
   - Use factories from `src/test/factories.ts` for mock data
3. **Run tests** using `npm test -- --run`
4. **Verify tests FAIL** (Red phase):
   - Tests should fail because code doesn't exist yet
   - Confirm failure messages are clear
   - If tests don't fail, something is wrong with the tests

**PHASE 2: GREEN - Make Tests Pass**

5. **Implement the minimum code** to make tests pass:
   - Follow ALL patterns from CLAUDE.md:
     - **i18n REQUIRED**: ALL user-facing strings must use `t()` from `useTranslation`
     - **i18n Setup**: Add translation keys to `src/lib/i18n/locales/en/[feature].json` FIRST
     - API response format: `{ success, data?, error? }`
     - Next.js 16 async params: `await params`
     - Zod validation with `safeParse`
     - MUI dialog pattern for forms
     - Service layer for API calls
     - TypeScript strict mode
   - Implement only what's needed to pass tests
   - Don't add extra features
6. **Run tests again** using `npm test -- --run`
7. **Verify tests PASS** (Green phase):
   - All tests should now pass
   - If tests still fail, fix the implementation
   - Don't move forward until all tests pass

**PHASE 3: REFACTOR - Improve Code Quality**

8. **Refactor if needed**:
   - Clean up code
   - Remove duplication
   - Improve naming
   - Optimize performance
9. **Run tests after refactoring** to ensure nothing broke
10. Mark tasks complete as you finish them

### Step 5: Document

If you discovered new patterns or conventions:

1. Update CLAUDE.md with the new patterns
2. Add code examples
3. Add to Session summary

## Example Usage

```
User: /feature Add a user profile page with avatar upload

Claude:
I'll create a user profile feature. Let me first read CLAUDE.md to understand the conventions...

After reading CLAUDE.md, here's my plan:

**TDD Approach - Tests First:**

**Phase 1 - Write Tests (Red):**
1. src/lib/validations/user.test.ts - Test avatar validation schema
2. src/lib/api/users.test.ts - Test avatar upload API service
3. src/components/profile/AvatarUpload.test.tsx - Test upload component

**Phase 2 - Implementation (Green):**
4. src/lib/validations/user.ts - Avatar validation schema
5. src/app/api/users/[id]/avatar/route.ts - POST endpoint for avatar upload
6. src/lib/api/users.ts - Avatar upload API service
7. src/components/profile/AvatarUpload.tsx - Avatar upload component
8. src/app/profile/page.tsx - Profile page component

**Following These Patterns from CLAUDE.md:**
- Next.js 16 async params pattern
- API response format: { success, data?, error? }
- MUI dialog pattern for upload modal
- Zod validation for file upload
- Mocked fetch for API tests

**Redux State:**
- No changes needed, will use existing users slice

**TDD Workflow:**
1. ✍️ Write tests (expect them to fail)
2. ▶️ Run: npm test -- --run (verify RED)
3. 💻 Implement feature
4. ▶️ Run: npm test -- --run (verify GREEN)
5. 🔧 Refactor if needed
6. ▶️ Run tests again (ensure still GREEN)

Ready to implement? [Yes/No]
```

## Notes

- Always read CLAUDE.md first
- Always create a plan before coding
- **Always write tests BEFORE implementation code (TDD)**
- **Always verify tests fail before implementing (Red)**
- **Always verify tests pass after implementing (Green)**
- Always use TodoWrite to track progress
- Always follow existing patterns
- Ask for clarification if the feature description is ambiguous
- Consider backwards compatibility
- Don't over-engineer - keep it simple

## TDD Benefits

Following TDD provides:

- **Better design**: Writing tests first forces you to think about the API
- **Confidence**: You know the code works because tests prove it
- **Documentation**: Tests serve as examples of how to use the code
- **Regression protection**: Future changes won't break existing functionality
- **Faster debugging**: When tests fail, you know exactly what broke

## Critical TDD Rule

**NEVER write implementation code before writing tests.** If you find yourself writing implementation code first, STOP and write the tests first.
