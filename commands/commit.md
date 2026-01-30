# Commit Command

Analyze staged changes and generate a conventional commit message following project conventions.

## Usage

```
/commit
```

## What This Command Does

1. **Analyzes staged changes** using `git diff --staged`
2. **Determines the type of change** (feat, fix, refactor, test, docs, etc.)
3. **Generates a conventional commit message** following the format:

   ```
   <type>(<scope>): <subject>

   <body>

   Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
   ```

4. **Creates the commit** with the generated message
5. **Verifies the commit** was successful

## Instructions for Claude

When the user runs `/commit`, follow these steps:

### Step 1: Check Git Status

First, verify there are staged changes to commit:

```bash
git status
```

If there are no staged changes:

- Inform the user
- Show `git status` output
- Suggest staging files with `git add`
- Do NOT proceed with commit

### Step 2: Analyze Staged Changes

Run git diff to see what's being committed:

```bash
git diff --staged --stat
git diff --staged
```

Analyze the changes to understand:

- **Files modified**: Which files are being changed
- **Type of changes**: New features, bug fixes, refactoring, tests, docs, etc.
- **Scope**: What area of the codebase is affected (e.g., api, ui, db, config)
- **Impact**: How significant are the changes

### Step 3: Determine Commit Type

Based on the changes, determine the conventional commit type:

- **feat**: New feature or functionality
- **fix**: Bug fix
- **refactor**: Code refactoring (no functionality change)
- **test**: Adding or updating tests
- **docs**: Documentation changes
- **style**: Code style/formatting (no logic change)
- **perf**: Performance improvements
- **chore**: Build process, dependencies, tooling
- **ci**: CI/CD configuration changes
- **revert**: Reverting a previous commit

### Step 4: Determine Scope

Identify the scope based on what's changed:

- **api**: API routes or services
- **ui**: UI components or pages
- **db**: Database schema or migrations
- **validation**: Zod schemas or validation logic
- **store**: Redux store/slices
- **search**: Search functionality
- **auth**: Authentication/authorization
- **config**: Configuration files
- **deps**: Dependencies
- Leave blank if change spans multiple areas

### Step 5: Generate Commit Message

Create a commit message following this structure:

**Subject line** (max 72 chars):

```
<type>(<scope>): <imperative verb> <what was done>
```

Examples:

- `feat(search): add search functionality to users page`
- `fix(api): handle null email in user validation`
- `test(users): add search utility tests`
- `refactor(ui): extract search field into component`

**Body** (optional but recommended for non-trivial changes):

- Explain WHAT changed and WHY (not HOW - that's in the code)
- Bullet points are fine
- Reference issues if applicable

**Footer**:

- Always include: `Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>`
- Breaking changes: `BREAKING CHANGE: description`

### Step 6: Create the Commit

Use heredoc for proper formatting:

```bash
git commit -m "$(cat <<'EOF'
<type>(<scope>): <subject>

<body>

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

### Step 7: Verify and Report

After committing:

```bash
git log -1 --format="%H %s"
git show --stat HEAD
```

Report the results in this format:

```markdown
## Commit Created ✅

**Type**: <type>
**Scope**: <scope>
**Message**: <subject>

**Commit Hash**: <hash>

**Files Changed**:

- file1.ts
- file2.tsx

**Next Steps**:

- Run tests: `npm test -- --run`
- Push to remote: `git push`
- Create PR: Use `/pr` command
```

## Example Usage

```
User: /commit

Claude:
Let me analyze the staged changes...

[Runs: git diff --staged --stat]

I can see the following changes:
- src/lib/utils/search.ts (new file)
- src/lib/utils/search.test.ts (new file)
- src/app/organisations/page.tsx (modified)
- src/app/users/page.tsx (modified)

This appears to be a new feature adding search functionality. Let me create a conventional commit message...

[Runs: git commit with generated message]

## Commit Created ✅

**Type**: feat
**Scope**: search
**Message**: add search functionality to organisations and users pages

**Commit Hash**: a1b2c3d

**Changes**:
- Added generic search utility with TypeScript support
- Added comprehensive search tests (22 tests)
- Integrated search into organisations page
- Integrated search into users page
- Search supports partial matching and is case-insensitive

**Next Steps**:
- Run tests to verify: `npm test -- --run`
- Push to remote: `git push`
- Create PR: Use `/pr` command
```

````
User: /commit

Claude:
Checking git status...

No staged changes found. Please stage your changes first:

```bash
# Stage specific files
git add <file>

# Stage all changes
git add .

# Stage interactively
git add -p
````

Then run `/commit` again.

```

## Conventional Commit Types Reference

**Types and when to use them:**

- **feat**: Adding a new feature
  - Example: `feat(search): add search to users page`

- **fix**: Fixing a bug
  - Example: `fix(api): handle missing email validation`

- **refactor**: Restructuring code without changing behavior
  - Example: `refactor(ui): extract common dialog logic`

- **test**: Adding or updating tests
  - Example: `test(search): add edge case tests`

- **docs**: Documentation only changes
  - Example: `docs(readme): update setup instructions`

- **style**: Code style/formatting (white-space, formatting, semicolons)
  - Example: `style(api): fix indentation`

- **perf**: Performance improvements
  - Example: `perf(search): optimize filtering algorithm`

- **chore**: Tooling, dependencies, build process
  - Example: `chore(deps): update vitest to v2.1.9`

- **ci**: CI/CD configuration
  - Example: `ci(github): add test workflow`

- **revert**: Reverting a previous commit
  - Example: `revert: feat(search): add search functionality`

## Notes

- **NEVER** commit without analyzing the changes first
- **NEVER** use the `-a` flag (commit all changes) - only commit staged files
- Always follow conventional commit format for consistency
- Keep subject line under 72 characters
- Use imperative mood ("add" not "added" or "adds")
- Don't capitalize the first letter after the colon
- No period at the end of the subject line
- Include Co-Authored-By footer
- If unsure about the type or scope, ask the user
- Run tests after committing to verify nothing broke
- For breaking changes, add `BREAKING CHANGE:` in the footer
- Group related changes in a single commit (atomic commits)
- Don't commit half-finished work
```
