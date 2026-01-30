#!/bin/bash
# Log all Bash commands for audit trail and learning

# Read hook input from stdin
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Only log Bash commands
if [ "$TOOL_NAME" != "Bash" ] || [ -z "$COMMAND" ]; then
  exit 0
fi

# Create log directory if it doesn't exist
# Use CLAUDE_PROJECT_DIR if set, otherwise use current directory
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
LOG_DIR="$PROJECT_DIR/.claude/logs"
mkdir -p "$LOG_DIR"

# Log file with date
LOG_FILE="$LOG_DIR/bash-commands-$(date +%Y-%m-%d).log"

# Log entry with timestamp
TIMESTAMP=$(date +"%H:%M:%S")
echo "[$TIMESTAMP] $COMMAND" >> "$LOG_FILE"

exit 0
