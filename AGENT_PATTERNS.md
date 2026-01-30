# Custom Agent Patterns for Claude Learn Project

## Pattern 1: Feature Readiness Checker

### Purpose

Verify that a feature is complete and ready for deployment by checking all implementation layers.

### Agent Type

`general-purpose` (needs access to all tools for comprehensive checking)

### When to Use

- Before marking a feature as "done"
- Before creating a pull request
- During code review process
- When validating feature completeness

### Input Requirements

- Feature name or description
- Optional: specific files to check

### Expected Output

Checklist showing completion status for:

1. **Database Layer** - Schema, migrations present?
2. **Validation Layer** - Zod schemas created?
3. **API Layer** - Routes implemented with proper error handling?
4. **Service Layer** - Client API functions created?
5. **State Management** - Redux slices updated?
6. **UI Layer** - Components and pages created?
7. **Tests** - All layers tested?
8. **Documentation** - CLAUDE.md updated?

### Success Criteria

- All layers checked
- Clear ✅/❌ status for each
- Specific file paths provided
- Missing items identified

### Example Usage

```typescript
Task({
  subagent_type: 'general-purpose',
  description: 'Check user management feature',
  prompt: `Check if the "user management" feature is complete and ready for deployment.

  Verify each layer:

  1. DATABASE LAYER
     - Check src/db/schema/ for user table definition
     - Check drizzle/ for user migrations
     - Status: ✅ Present / ❌ Missing

  2. VALIDATION LAYER
     - Check src/lib/validations/ for user schemas
     - Verify createUserSchema and updateUserSchema exist
     - Check test file: src/lib/validations/user.test.ts
     - Status: ✅ Present / ❌ Missing

  3. API LAYER
     - Check src/app/api/users/route.ts (GET all, POST)
     - Check src/app/api/users/[id]/route.ts (GET one, PATCH, DELETE)
     - Verify async params pattern used
     - Verify Zod validation used
     - Verify consistent error handling
     - Status: ✅ Present / ❌ Missing

  4. SERVICE LAYER
     - Check src/lib/api/users.ts for client functions
     - Verify functions: fetchUsers, createUser, updateUser, deleteUser
     - Check test file: src/lib/api/users.test.ts
     - Status: ✅ Present / ❌ Missing

  5. STATE MANAGEMENT
     - Check src/store/slices/usersSlice.ts
     - Verify actions: setUsers, addUser, updateUser, removeUser
     - Check test file: src/store/slices/usersSlice.test.ts
     - Status: ✅ Present / ❌ Missing

  6. UI LAYER
     - Check src/app/users/page.tsx for list page
     - Check src/components/users/UserDialog.tsx for create/edit
     - Status: ✅ Present / ❌ Missing

  7. TESTS
     - Validation tests present?
     - API service tests present?
     - Redux slice tests present?
     - Component tests present?
     - Status: ✅ / ⚠️ Partial / ❌ Missing

  8. DOCUMENTATION
     - Is feature documented in CLAUDE.md?
     - Are API patterns documented?
     - Status: ✅ Present / ❌ Missing

  Return a summary report with:
  - Overall readiness: Ready / Needs Work / Incomplete
  - Completion percentage
  - List of missing items (if any)
  - Recommendations for next steps`,
});
```

### Example Output

```markdown
## Feature Readiness Report: User Management

**Overall Status**: ✅ READY FOR DEPLOYMENT
**Completion**: 95% (7/8 layers complete)

### Layer Checklist

| Layer            | Status | Details                                                           |
| ---------------- | ------ | ----------------------------------------------------------------- |
| Database         | ✅     | users table in src/db/schema/users.ts, migration present          |
| Validation       | ✅     | Schemas in src/lib/validations/user.ts, 16 tests passing          |
| API Routes       | ✅     | All CRUD routes present, async params, validation, error handling |
| Service Layer    | ✅     | All functions in src/lib/api/users.ts, 17 tests passing           |
| State Management | ✅     | Redux slice complete, 13 tests passing                            |
| UI Components    | ✅     | List page + dialog present                                        |
| Tests            | ⚠️     | Backend fully tested (46 tests), UI untested                      |
| Documentation    | ✅     | Documented in CLAUDE.md Session 5                                 |

### Missing Items

**Component Tests** (Non-blocking):

- src/app/users/page.tsx - No tests
- src/components/users/UserDialog.tsx - No tests

### Recommendations

1. ✅ **Feature is deployment-ready** - All critical paths tested
2. Consider adding component tests in future iteration
3. All API, validation, and state management fully tested

**Risk Level**: Low - Backend is solid, frontend works but untested
```

---

## Pattern 2: Test Coverage Analyzer

### Purpose

Identify which files are missing tests and prioritize testing efforts.

### Agent Type

`Explore` (fast file/content searching)

### When to Use

- Before code review
- When planning testing work
- During feature development
- As part of CI/CD pipeline

### Input Requirements

- Directory to analyze
- Optional: specific file patterns

### Expected Output

- List of files without corresponding test files
- Test coverage statistics
- Priority ranking for adding tests

### Example Usage

```typescript
Task({
  subagent_type: 'Explore',
  description: 'Analyze test coverage',
  prompt: `Analyze test coverage for the src/lib/ directory.

  For each .ts file (excluding .test.ts):
  1. Check if corresponding .test.ts exists
  2. If tests exist, count number of test cases
  3. If no tests, assess priority (high/medium/low) based on:
     - File complexity
     - Business logic presence
     - Usage frequency

  Return:
  - Total files analyzed
  - Files with tests (%)
  - Files without tests (with priority)
  - Recommendations for which files to test first

  Use "quick" thoroughness.`,
  model: 'haiku',
});
```

---

## Pattern 3: Breaking Change Detector

### Purpose

Detect changes that might break existing functionality or API contracts.

### Agent Type

`general-purpose` (needs git, file reading, and analysis)

### When to Use

- Before committing changes
- During code review
- Before creating pull requests

### Input Requirements

- Git diff or specific file changes

### Expected Output

- List of breaking changes detected
- Impact assessment
- Migration recommendations

### Example Usage

```typescript
Task({
  subagent_type: 'general-purpose',
  description: 'Detect breaking changes',
  prompt: `Analyze git diff for breaking changes.

  Check for:
  1. API route signature changes (params, return types)
  2. Database schema modifications (field removals, type changes)
  3. Validation schema changes (stricter rules)
  4. Function signature changes in exported modules
  5. Removed or renamed exports

  For each breaking change found:
  - Describe the change
  - Assess impact (Critical/High/Medium/Low)
  - Suggest migration strategy

  Return a report with:
  - Summary: Breaking changes count
  - Details of each breaking change
  - Overall risk assessment`,
});
```

---

## Pattern 4: Performance Analyzer

### Purpose

Identify potential performance issues in code changes.

### Agent Type

`general-purpose`

### When to Use

- When adding new features
- During optimization work
- Before production deployment

### Input Requirements

- Files to analyze
- Optional: performance criteria

### Expected Output

- Performance concerns identified
- Severity levels
- Optimization suggestions

### Example Usage

```typescript
Task({
  subagent_type: 'general-purpose',
  description: 'Analyze performance',
  prompt: `Analyze performance implications of recent changes.

  Check for:
  1. N+1 query problems (multiple DB calls in loops)
  2. Missing indexes on database queries
  3. Large data fetches without pagination
  4. Inefficient algorithms (O(n²) or worse)
  5. Missing React.memo for expensive components
  6. Large bundle size additions

  For each issue:
  - Describe the problem
  - Estimate performance impact
  - Suggest optimization

  Return:
  - Performance score: Good/Fair/Poor
  - List of issues with severity
  - Optimization recommendations`,
});
```

---

## Pattern 5: Security Vulnerability Scanner

### Purpose

Detect common security vulnerabilities in code.

### Agent Type

`general-purpose`

### When to Use

- Before committing code
- During security reviews
- For sensitive features (auth, payments, etc.)

### Input Requirements

- Files to scan
- Security checklist

### Expected Output

- Vulnerabilities found
- Severity ratings
- Remediation steps

### Example Usage

```typescript
Task({
  subagent_type: 'general-purpose',
  description: 'Scan for security issues',
  prompt: `Scan code for security vulnerabilities.

  Check for:
  1. SQL injection risks (raw queries)
  2. XSS vulnerabilities (unsanitized user input)
  3. Authentication bypasses
  4. Authorization issues (missing permission checks)
  5. Secrets in code (API keys, passwords)
  6. Insecure dependencies
  7. CSRF vulnerabilities
  8. Insecure data storage

  For each vulnerability:
  - File and line number
  - Severity: Critical/High/Medium/Low
  - Exploitation scenario
  - Fix recommendation

  Return:
  - Security status: Secure/Needs Review/Vulnerable
  - List of issues
  - Remediation plan`,
});
```

---

## Pattern 6: Documentation Completeness Checker

### Purpose

Verify that code changes are properly documented.

### Agent Type

`Explore` (fast file searching)

### When to Use

- Before pull requests
- During documentation reviews
- As part of feature completion

### Input Requirements

- Changed files
- Documentation standards

### Expected Output

- Documentation status for each change
- Missing documentation identified
- Quality assessment

### Example Usage

```typescript
Task({
  subagent_type: 'Explore',
  description: 'Check documentation',
  prompt: `Check documentation completeness for recent changes.

  For each changed file, verify:
  1. Function/class has JSDoc comments
  2. Complex logic has inline comments
  3. API routes documented in CLAUDE.md
  4. Breaking changes noted in comments
  5. Type definitions include descriptions

  Return:
  - Files with complete docs: count
  - Files with incomplete docs: list with missing items
  - Overall documentation score: Good/Fair/Poor

  Use "quick" thoroughness.`,
  model: 'haiku',
});
```

---

## Pattern 7: Dependency Impact Analyzer

### Purpose

Analyze impact of adding or upgrading dependencies.

### Agent Type

`general-purpose`

### When to Use

- Before adding new npm packages
- Before upgrading dependencies
- During security audits

### Input Requirements

- Package name and version
- Current package.json

### Expected Output

- Dependency analysis
- Security concerns
- Bundle size impact
- Compatibility issues

### Example Usage

```typescript
Task({
  subagent_type: 'general-purpose',
  description: 'Analyze dependency impact',
  prompt: `Analyze the impact of adding/upgrading [package-name].

  Check:
  1. Bundle size impact (check package size)
  2. Security vulnerabilities (npm audit)
  3. License compatibility
  4. Peer dependency conflicts
  5. Breaking changes in upgrade
  6. Alternatives comparison

  Return:
  - Recommendation: Proceed/Review/Block
  - Pros and cons
  - Impact summary
  - Alternative suggestions (if applicable)`,
});
```

---

## Best Practices for Custom Agents

### 1. Clear Prompts

- Specify exact steps agent should take
- Define expected output format
- Include examples when helpful

### 2. Choose Right Agent Type

- `Explore` for file/content searches (fast, use haiku)
- `general-purpose` for complex multi-step tasks
- `Bash` for command execution only

### 3. Context Isolation

- Remember agents don't see main conversation
- Provide all necessary context in prompt
- Include file paths, patterns to search

### 4. Output Format

- Request structured output (checklists, tables, reports)
- Specify severity levels for issues
- Ask for actionable recommendations

### 5. Model Selection

- Use `model: "haiku"` for simple searches/checks
- Use default (sonnet) for complex analysis
- Consider cost vs. quality tradeoffs

### 6. Error Handling

- Agents may fail or return incomplete results
- Always validate agent output before using
- Have fallback plans for agent failures

### 7. Parallel Execution

- Spawn independent agents in single message
- Combine results for comprehensive reports
- Save time on multi-faceted analysis

---

## Creating New Agent Patterns

When designing a new agent pattern, use this template:

````markdown
## Pattern Name: [Descriptive Name]

### Purpose

[What problem does this agent solve?]

### Agent Type

[Bash/general-purpose/Explore/Plan]

### When to Use

- [Scenario 1]
- [Scenario 2]
- [Scenario 3]

### Input Requirements

- [What information the agent needs]
- [Optional parameters]

### Expected Output

- [What the agent should return]
- [Output format]

### Success Criteria

- [How to validate agent succeeded]
- [Quality checks]

### Example Usage

```typescript
Task({
  subagent_type: '...',
  description: '...',
  prompt: `...`,
  model: 'haiku', // optional
});
```
````

````

### Example Output
```markdown
[Show example of what agent returns]
````

### Notes

- [Any special considerations]
- [Known limitations]
- [Tips for best results]

```

---

## Summary

These agent patterns provide reusable templates for common development tasks. By using specialized agents, you can:

- ✅ Automate repetitive checks
- ✅ Maintain consistency across projects
- ✅ Reduce human error
- ✅ Speed up development workflows
- ✅ Improve code quality

Agents are powerful tools for building automated development workflows!
```
