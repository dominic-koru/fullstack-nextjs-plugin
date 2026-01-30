#!/bin/bash
# Combined formatter and linter hook for TypeScript projects

# Read hook input from stdin
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Format with Prettier
if [[ "$FILE_PATH" =~ \.(ts|tsx|jsx|js|json|md)$ ]]; then
  npx prettier --write "$FILE_PATH" 2>/dev/null || true
fi

# Run ESLint on TypeScript/JavaScript files
if [[ "$FILE_PATH" =~ \.(ts|tsx|js|jsx)$ ]]; then
  npx eslint "$FILE_PATH" --fix 2>/dev/null || true
fi

# TypeCheck TypeScript files (just the single file)
if [[ "$FILE_PATH" =~ \.(ts|tsx)$ ]]; then
  # Note: tsc --noEmit checks the entire project, not just one file
  # For single file check, we'd need a different approach
  # For now, we'll skip per-file typecheck and rely on full project checks
  true
fi

exit 0
