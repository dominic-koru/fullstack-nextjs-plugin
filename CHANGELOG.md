# Changelog

All notable changes to the Full-Stack Next.js Plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-30

### Added

- Initial release of the Full-Stack Next.js Development Plugin
- **Commands (5)**:
  - `/feature` - Build features following TDD workflow
  - `/test` - Run tests with consistent reporting
  - `/review` - Review code for quality and conventions
  - `/commit` - Create conventional commits
  - `/pr` - Create pull requests
- **Skills (3)**:
  - `nextjs-api` - Next.js 16 API patterns with error handling and validation
  - `playwright-e2e` - E2E testing with hybrid approach (testid + translations)
  - `mui-components` - Material-UI v6 component patterns
- **Hooks (5)**:
  - Pre-commit validation (type-check and tests)
  - Migration protection (block accidental edits)
  - Auto-format and lint
  - Auto-test on test file changes
  - Bash command logging
- Comprehensive documentation (README, HOOKS, SUBAGENTS, AGENT_PATTERNS)

### Technical Details

- Migrated from standalone `.claude/` configuration
- All paths use `${CLAUDE_PLUGIN_ROOT}` for portability
- Scripts are executable and cross-platform compatible
- Follows Claude Code plugin best practices
