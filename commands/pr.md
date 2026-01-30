# PR Command

Create a pull request with a comprehensive description by analyzing changes since the branch diverged from the base branch.

## Usage

```
/pr [base-branch]
```

**Parameters:**

- `base-branch` (optional): The branch to create PR against (defaults to `main` or `master`)

## What This Command Does

1. **Analyzes all commits** in the current branch since it diverged from base
2. **Reviews code changes** across all commits (not just the latest)
3. **Generates a comprehensive PR description** with:
   - Summary of changes
   - Test plan
   - Breaking changes (if any)
4. **Creates the pull request** using GitHub CLI (`gh`)
5. **Returns the PR URL** for review

## Instructions for Claude

When the user runs `/pr [base-branch]`, follow these steps:

### Step 1: Verify Prerequisites

Check that everything is ready:

```bash
# Check if on a git branch
git rev-parse --abbrev-ref HEAD

# Check if gh CLI is installed
gh --version

# Check if authenticated
gh auth status
```

If any prerequisite fails:

- Inform the user what's missing
- Provide installation/setup instructions
- Do NOT proceed

### Step 2: Determine Base Branch

If base branch not provided:

```bash
# Try to detect main branch
git remote show origin | grep "HEAD branch"
```

Common base branches:

- `main`
- `master`
- `develop`
- `dev`

If unsure, ask the user.

### Step 3: Analyze Branch Status

Check current branch status:

```bash
# Get current branch name
git rev-parse --abbrev-ref HEAD

# Check if branch tracks a remote
git rev-parse --abbrev-ref @{upstream} 2>/dev/null

# Check if up to date with remote
git status -uno
```

If branch is not pushed to remote:

- Inform user it needs to be pushed first
- Show command: `git push -u origin <branch-name>`
- Ask if they want you to push it

### Step 4: Analyze ALL Changes Since Branch Diverged

**CRITICAL**: Analyze ALL commits and changes, not just the latest commit!

```bash
# Get all commits in this branch since diverging from base
git log <base-branch>..HEAD --oneline

# Get full commit history with details
git log <base-branch>..HEAD --format="%h %s%n%b"

# See all file changes since divergence
git diff <base-branch>...HEAD --stat

# See full diff of all changes
git diff <base-branch>...HEAD
```

Review EVERY commit to understand:

- What features were added
- What bugs were fixed
- What was refactored
- What tests were added
- Dependencies changed
- Breaking changes introduced

### Step 5: Generate PR Title

Create a concise PR title based on ALL changes:

Format: `<type>: <brief summary of all changes>`

Examples:

- `feat: add user management with search functionality`
- `fix: resolve authentication issues and improve error handling`
- `feat: implement search across organisations and users`

Keep it under 72 characters.

### Step 6: Generate PR Description

Create a comprehensive PR description in this format:

```markdown
## Summary

<1-3 bullet points summarizing ALL changes in this PR, not just the latest commit>

- Added X feature with Y functionality
- Fixed Z bug affecting ABC
- Improved performance of DEF

## Changes

### Features

- List all new features added across ALL commits

### Bug Fixes

- List all bugs fixed across ALL commits

### Refactoring

- List any refactoring done

### Tests

- List test coverage added
- Mention test results (X tests passing)

### Documentation

- List documentation updates

## Breaking Changes

<If any breaking changes, list them here with migration guide. Otherwise say "None">

## Test Plan

- [ ] All existing tests pass (`npm test`)
- [ ] New tests added for new functionality
- [ ] Manual testing completed for:
  - <List key user flows to test>
  - <Specific scenarios to verify>
- [ ] Build succeeds (`npm run build`)
- [ ] No TypeScript errors (`npx tsc --noEmit`)

## Screenshots/Demo

<If UI changes, mention that screenshots would be helpful, but don't generate them>

## Additional Context

<Any other relevant information>

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

### Step 7: Push Branch if Needed

If branch is not on remote:

```bash
git push -u origin <branch-name>
```

### Step 8: Create the Pull Request

Use GitHub CLI with heredoc for proper formatting:

```bash
gh pr create --title "PR title here" --body "$(cat <<'EOF'
## Summary

...full PR description...

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Options:

- `--base <branch>` - Specify base branch
- `--draft` - Create as draft PR (ask user if they want this)
- `--web` - Open browser after creating

### Step 9: Report Results

After creating PR:

```markdown
## Pull Request Created ✅

**PR #X**: <title>
**URL**: <pr-url>
**Base**: <base-branch> ← **Head**: <current-branch>

**Summary**:

- <key changes>

**Commits Included**: X commits

- <commit 1>
- <commit 2>
- ...

**Files Changed**: X files

- <file 1>
- <file 2>
- ...

**Next Steps**:

- Review the PR: <pr-url>
- Request reviews from team members
- Address any feedback
- Merge when approved

**CI/CD**: Check the PR page for build status and test results
```

## Example Usage

```
User: /pr

Claude:
Creating a pull request to main...

[Analyzes git log main..HEAD and git diff main...HEAD]

I found 3 commits since branching from main:
1. feat(search): add search utility with tests
2. feat(search): integrate search into organisations page
3. feat(search): integrate search into users page

Total changes:
- 4 files changed
- 300+ insertions
- 22 new tests added
- All 114 tests passing

Creating PR...

[Executes: gh pr create ...]

## Pull Request Created ✅

**PR #42**: feat: add search functionality to organisations and users
**URL**: https://github.com/user/claude-learn/pull/42
**Base**: main ← **Head**: feature/search

**Summary**:
- Added generic search utility with TypeScript support
- Integrated real-time search in organisations and users pages
- Added 22 comprehensive tests for search functionality

**Commits Included**: 3 commits
- feat(search): add search utility with tests (a1b2c3d)
- feat(search): integrate search into organisations page (b2c3d4e)
- feat(search): integrate search into users page (c3d4e5f)

**Files Changed**: 4 files
- src/lib/utils/search.ts
- src/lib/utils/search.test.ts
- src/app/organisations/page.tsx
- src/app/users/page.tsx

**Next Steps**:
- Review the PR: https://github.com/user/claude-learn/pull/42
- Request reviews from team members
- Merge when approved
```

````
User: /pr develop

Claude:
Creating a pull request to develop...

[Checks branch status]

⚠️ Your branch is not pushed to remote yet.

Current branch: feature/user-management
Remote tracking: Not set

Would you like me to push this branch first?

```bash
git push -u origin feature/user-management
````

Reply 'yes' to push and continue with PR creation.

````

## Error Handling

### GitHub CLI Not Installed

```markdown
❌ GitHub CLI (`gh`) is not installed.

Install it:

**macOS**:
```bash
brew install gh
````

**Linux**:

```bash
# Debian/Ubuntu
sudo apt install gh

# Fedora
sudo dnf install gh
```

**Windows**:

```bash
winget install GitHub.cli
```

After installing, authenticate:

```bash
gh auth login
```

````

### Not Authenticated

```markdown
❌ GitHub CLI is not authenticated.

Run:
```bash
gh auth login
````

Follow the prompts to authenticate with GitHub.

````

### No Changes to Create PR

```markdown
❌ No commits found since <base-branch>.

Your branch is up to date with <base-branch>. Make some changes first:

1. Make code changes
2. Stage changes: `git add .`
3. Commit: use `/commit` command
4. Then create PR: `/pr`
````

### Branch Already Has PR

```markdown
ℹ️ This branch already has an open pull request.

**PR #X**: <title>
**URL**: <pr-url>
**Status**: <Open/Draft>

Would you like to:

1. View the existing PR
2. Update the PR description
3. Close and create a new one
```

## Best Practices

**DO**:

- ✅ Analyze ALL commits in the branch, not just the latest
- ✅ Review the full diff to understand all changes
- ✅ Include a comprehensive summary of all work done
- ✅ Create a detailed test plan
- ✅ Mention breaking changes prominently
- ✅ Keep PR focused (single feature or related changes)
- ✅ Ensure all tests pass before creating PR
- ✅ Push branch before creating PR

**DON'T**:

- ❌ Only look at the latest commit
- ❌ Create PRs with failing tests
- ❌ Create PRs from branches with uncommitted changes
- ❌ Force push to main/master
- ❌ Create PRs without a clear description
- ❌ Mix unrelated changes in one PR

## Git Commands Reference

```bash
# View commits in current branch
git log main..HEAD --oneline

# View full changes since branch diverged
git diff main...HEAD

# View files changed
git diff main...HEAD --stat

# View specific commit
git show <commit-hash>

# Check branch status
git status

# Push current branch
git push -u origin <branch-name>

# List all branches
git branch -a

# See remote tracking
git branch -vv
```

## Notes

- **ALWAYS** analyze all commits, not just the latest
- Ensure tests pass before creating PR
- Use descriptive PR titles and comprehensive descriptions
- Include test plan and breaking changes
- Push branch to remote before creating PR
- Use `--draft` flag for work-in-progress PRs
- Add reviewers after creating PR if needed: `gh pr edit <number> --add-reviewer <username>`
- Link related issues: Include "Closes #123" in description
- For hotfixes to production, use appropriate base branch
