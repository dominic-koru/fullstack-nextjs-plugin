#!/bin/bash
# Validate code before git commits

# Read hook input from stdin
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Only run for git commit commands
if [ "$TOOL_NAME" != "Bash" ] || [[ ! "$COMMAND" =~ git[[:space:]]+commit ]]; then
  exit 0
fi

echo "🔍 Running pre-commit validation..." >&2
echo "" >&2

# Check 1: Run TypeScript type check
echo "Checking TypeScript types..." >&2
if ! npx tsc --noEmit 2>&1 | tail -10; then
  echo "" >&2
  echo "❌ BLOCKED: TypeScript type errors found!" >&2
  echo "Fix the type errors before committing." >&2
  exit 2
fi
echo "✅ TypeScript types OK" >&2
echo "" >&2

# Check 2: Run all tests
echo "Running tests..." >&2
if ! npm test -- --run 2>&1 | tail -10; then
  echo "" >&2
  echo "❌ BLOCKED: Tests are failing!" >&2
  echo "Fix the failing tests before committing." >&2
  exit 2
fi
echo "✅ All tests passing" >&2
echo "" >&2

# Check 3: Run linter
echo "Running ESLint..." >&2
if ! npm run lint 2>&1 | tail -5; then
  echo "" >&2
  echo "⚠️  Warning: ESLint found issues (not blocking)" >&2
  # Don't block on lint warnings, just report
fi

echo "" >&2
echo "✅ Pre-commit validation passed!" >&2
exit 0
