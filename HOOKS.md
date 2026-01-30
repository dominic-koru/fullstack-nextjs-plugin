# Claude Code Hooks Documentation

This project uses automated hooks to ensure code quality and prevent common mistakes.

## 🎯 Active Hooks

### Code Quality Hooks (PostToolUse)

#### 1. **Migration Protection** (`protect-migrations.sh`)
- **Triggers**: After `Write` or `Edit` tool
- **Purpose**: Prevents accidental edits to database migration files
- **Behavior**: **BLOCKS** edits to files in `drizzle/` directory
- **Exit code**: 2 (blocking error)
- **Message**: Displays instructions for proper schema changes

**Example blocked path**:
- ❌ `drizzle/0000_init.sql`
- ❌ `drizzle/migrations/anything.sql`

**Allowed paths**:
- ✅ `src/db/schema/organisations.ts` (edit schemas here instead)

---

#### 2. **Auto-Format and Lint** (`format-and-lint.sh`)
- **Triggers**: After `Write` or `Edit` tool
- **Purpose**: Automatically format and lint code
- **Actions**:
  - Runs **Prettier** on `.ts`, `.tsx`, `.js`, `.jsx`, `.json`, `.md` files
  - Runs **ESLint --fix** on TypeScript/JavaScript files
- **Exit code**: 0 (never blocks)
- **Silent**: Runs in background without interruption

**Example**:
```typescript
// Before (what you write)
export   const    bad={a:1,b:2};

// After (auto-formatted)
export const bad = { a: 1, b: 2 };
```

---

#### 3. **Auto-Run Tests** (`auto-test.sh`)
- **Triggers**: After `Write` or `Edit` on `.test.ts` files
- **Purpose**: Automatically run tests when test files are edited
- **Behavior**: Runs specific test file with `npm test -- --run`
- **Exit code**: 0 (reports results but doesn't block)
- **Output**: Last 5 lines of test results

**Example**:
```bash
🧪 Running tests for src/lib/api/users.test.ts...
✅ Tests passed
```

---

#### 4. **Bash Command Logging** (`log-bash-commands.sh`)
- **Triggers**: After `Bash` tool
- **Purpose**: Audit trail of all Bash commands
- **Log location**: `.claude/logs/bash-commands-YYYY-MM-DD.log`
- **Format**: `[HH:MM:SS] command`
- **Exit code**: 0 (never blocks)

**Example log**:
```
[08:45:15] npm test
[08:45:30] git status
[08:46:02] npm run build
```

---

### Safety Hooks (PreToolUse)

#### 5. **Pre-Commit Validation** (`pre-commit-validation.sh`)
- **Triggers**: **BEFORE** `Bash` commands containing `git commit`
- **Purpose**: Ensure code quality before commits
- **Checks**:
  1. ✅ TypeScript type-check (`tsc --noEmit`)
  2. ✅ All tests pass (`npm test -- --run`)
  3. ⚠️ ESLint (warns but doesn't block)
- **Exit code**: 2 if type errors or test failures (blocks commit)
- **Timeout**: 120 seconds

**Example output**:
```
🔍 Running pre-commit validation...

Checking TypeScript types...
✅ TypeScript types OK

Running tests...
✅ All tests passing

Running ESLint...
⚠️  Warning: ESLint found issues (not blocking)

✅ Pre-commit validation passed!
```

**If tests fail**:
```
❌ BLOCKED: Tests are failing!
Fix the failing tests before committing.
```

---

## 🔄 Hook Execution Order

### When you edit a file:

```
1. Edit tool executes → file is modified
   ↓
2. PostToolUse hooks run in sequence:
   ├─ Migration protection (blocks if migration file)
   ├─ Auto-format and lint (silent)
   └─ Auto-run tests (if test file)
   ↓
3. Control returns to Claude
```

### When you run a Bash command:

```
1. PreToolUse hooks run BEFORE command:
   └─ Pre-commit validation (blocks if git commit and tests fail)
   ↓
2. Bash command executes (if not blocked)
   ↓
3. PostToolUse hooks run AFTER command:
   └─ Bash command logging (silent)
   ↓
4. Control returns to Claude
```

---

## 🛠️ Hook Configuration

Hooks are defined in `.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [...]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [...]
      },
      {
        "matcher": "Bash",
        "hooks": [...]
      }
    ]
  }
}
```

---

## 📝 Viewing Hook Logs

### Bash command history:
```bash
# Today's commands
cat .claude/logs/bash-commands-$(date +%Y-%m-%d).log

# All commands this week
cat .claude/logs/bash-commands-*.log | grep -A 2 "npm"
```

### Hook execution (requires Claude Code debug mode):
```bash
# Start Claude Code with debug output
claude --debug
```

---

## 🚫 Disabling Hooks Temporarily

### Option 1: Comment out in settings.json
Edit `.claude/settings.json` and comment out specific hooks.

### Option 2: Use settings.local.json
Create `.claude/settings.local.json` (gitignored) to override:

```json
{
  "hooks": {
    "PostToolUse": [],
    "PreToolUse": []
  }
}
```

### Option 3: Rename hook scripts
```bash
mv .claude/hooks/auto-test.sh .claude/hooks/auto-test.sh.disabled
```

---

## 🔍 Testing Hooks Manually

You can test hook scripts manually:

```bash
# Test migration protection
echo '{"tool_input": {"file_path": "drizzle/0000.sql"}}' | \
  bash .claude/hooks/protect-migrations.sh

# Test bash logging
echo '{"tool_name": "Bash", "tool_input": {"command": "ls"}}' | \
  bash .claude/hooks/log-bash-commands.sh

# View logged command
tail -1 .claude/logs/bash-commands-$(date +%Y-%m-%d).log
```

---

## 📚 Hook Development Tips

### Exit codes matter:
- **0** = Success, continue normally
- **1** = Error, report but don't block
- **2** = Blocking error, prevent operation

### Timeout values:
- Format/lint: 45 seconds
- Tests: 60 seconds
- Pre-commit: 120 seconds
- Logging: 5 seconds

### Environment variables:
- `$CLAUDE_PROJECT_DIR` = Project root directory
- Use fallback: `${CLAUDE_PROJECT_DIR:-$(pwd)}`

### JSON parsing:
All hook input comes via **stdin as JSON**. Use `jq` to parse:

```bash
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
```

---

## 🎓 Learning Resources

- [Claude Code Hooks Guide](https://code.claude.com/docs/en/hooks-guide.md)
- [Hook Reference](https://code.claude.com/docs/en/hooks.md)
- [Settings Documentation](https://code.claude.com/docs/en/settings.md)

---

## ⚡ Quick Reference

| Hook | When | Blocks? | Purpose |
|------|------|---------|---------|
| Migration Protection | Post Edit/Write | ✅ Yes | Prevent migration edits |
| Format & Lint | Post Edit/Write | ❌ No | Auto-format code |
| Auto-Test | Post Edit/Write | ❌ No | Run tests on changes |
| Bash Logging | Post Bash | ❌ No | Audit command history |
| Pre-Commit | Pre Bash (git commit) | ✅ Yes | Validate before commits |

---

**Note**: Hooks are loaded when Claude Code starts. After modifying `.claude/settings.json`, restart your Claude Code session for changes to take effect.
