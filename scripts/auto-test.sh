#!/bin/bash
# Auto-run tests when test files are edited

# Read hook input from stdin
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Only run for test files
if [[ "$FILE_PATH" =~ \.test\.(ts|tsx|js|jsx)$ ]]; then
  echo "🧪 Running tests for $FILE_PATH..." >&2

  # Run the specific test file
  if npm test -- --run "$FILE_PATH" 2>&1 | tail -5; then
    echo "✅ Tests passed" >&2
  else
    echo "⚠️  Some tests failed - check output above" >&2
    # Don't block the operation, just warn
    exit 0
  fi
fi

exit 0
