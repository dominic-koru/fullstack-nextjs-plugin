#!/bin/bash
# Prevent editing database migration files

# Read hook input from stdin
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Check if file is in migrations directory
if [[ "$FILE_PATH" =~ drizzle/.*\.sql$ ]] || [[ "$FILE_PATH" =~ drizzle/migrations/ ]]; then
  echo "⚠️  BLOCKED: Cannot edit migration files!" >&2
  echo "" >&2
  echo "Migration files should be immutable once created." >&2
  echo "File: $FILE_PATH" >&2
  echo "" >&2
  echo "If you need to modify the schema:" >&2
  echo "  1. Make changes in src/db/schema/" >&2
  echo "  2. Run: npm run db:generate" >&2
  echo "  3. Review the new migration file" >&2
  echo "  4. Run: npm run db:migrate" >&2

  # Exit code 2 blocks the operation in Claude Code
  exit 2
fi

exit 0
