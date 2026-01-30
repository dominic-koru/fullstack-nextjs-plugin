# Full-Stack Next.js Development Plugin

A comprehensive Claude Code plugin for building full-stack Next.js applications with Test-Driven Development (TDD), end-to-end testing, and Material-UI components.

## 🎯 What's Included

### Commands (5)

Custom slash commands for streamlined development workflows:

- `/fullstack-nextjs-plugin:feature` - Build features following TDD workflow
- `/fullstack-nextjs-plugin:test` - Run tests with consistent reporting
- `/fullstack-nextjs-plugin:review` - Review code for quality and conventions
- `/fullstack-nextjs-plugin:commit` - Create conventional commits
- `/fullstack-nextjs-plugin:pr` - Create pull requests with comprehensive descriptions

### Skills (3)

Advanced skills with comprehensive reference documentation:

#### 1. **Next.js API Patterns** (`nextjs-api`)

- Next.js 16 API route patterns (async params, proxy.ts)
- Consistent error handling
- Zod validation patterns
- CRUD route templates

**References:**

- `error-handling.md` - Error handling patterns
- `validation-patterns.md` - Zod validation examples

#### 2. **Playwright E2E Testing** (`playwright-e2e`)

- Hybrid testing approach (testid + translations)
- CRUD operation patterns
- Dialog and search test templates
- Accessibility testing

**References:**

- `crud-patterns.md` - CRUD test patterns
- `dialog-patterns.md` - Dialog interaction patterns
- `search-patterns.md` - Search and pagination patterns
- `accessibility-patterns.md` - Accessibility testing
- `validation-patterns.md` - Form validation tests

#### 3. **MUI Components** (`mui-components`)

- Material-UI v6 patterns
- Form and table templates
- Theme configuration
- Responsive design patterns

**References:**

- `form-patterns.md` - Form component patterns
- `table-patterns.md` - Table and data grid patterns
- `theme-patterns.md` - Theme customization

### Hooks (5)

Automated quality checks and formatting:

- **Pre-commit validation** - Type-check and test before commits
- **Protect migrations** - Block edits to migration files
- **Format and lint** - Auto-format code after edits
- **Auto-test** - Run tests when test files change
- **Log Bash commands** - Audit trail of all commands

## 📦 Installation

### Option 1: Local Development (Testing)

```bash
# From your project directory
claude --plugin-dir /path/to/fullstack-nextjs-plugin
```

### Option 2: As a Marketplace Plugin

```bash
# Add as local marketplace
/plugin marketplace add /path/to/fullstack-nextjs-plugin-directory

# Install in user scope (available in all projects)
/plugin install fullstack-nextjs-plugin --scope user

# Or install in project scope (shared with team)
/plugin install fullstack-nextjs-plugin --scope project
```

### Option 3: From GitHub (After Publishing)

```bash
# Add your GitHub repository as a marketplace
/plugin marketplace add your-username/fullstack-nextjs-plugin

# Install the plugin
/plugin install fullstack-nextjs-plugin@your-username
```

## 🚀 Usage

### Using Commands

Commands are namespaced with the plugin name:

```bash
# Build a new feature with TDD
/fullstack-nextjs-plugin:feature Add user authentication

# Run tests
/fullstack-nextjs-plugin:test

# Review code changes
/fullstack-nextjs-plugin:review

# Create a commit
/fullstack-nextjs-plugin:commit

# Create a pull request
/fullstack-nextjs-plugin:pr main
```

### Using Skills

Skills are invoked automatically by Claude when relevant, or you can reference them:

```bash
# Claude will automatically use these skills when:
# - Writing Next.js API routes (nextjs-api skill)
# - Creating Playwright tests (playwright-e2e skill)
# - Building MUI components (mui-components skill)
```

### Hooks Behavior

Once installed, hooks run automatically:

- **After editing code** → Auto-format, lint, and test
- **Before commits** → Validate types and run tests
- **On migration edits** → Block accidental changes
- **After Bash commands** → Log for audit trail

## 🛠️ Tech Stack Assumptions

This plugin is optimized for projects using:

- **Next.js 16** (with App Router, async params, Turbopack)
- **TypeScript** (strict mode)
- **PostgreSQL** + Drizzle ORM
- **Material-UI v6** (with CSS variables)
- **Redux Toolkit** (state management)
- **Zod** (validation)
- **Vitest** (unit tests)
- **Playwright** (E2E tests)

## 📁 Plugin Structure

```
fullstack-nextjs-plugin/
├── .claude-plugin/
│   └── plugin.json              # Plugin manifest
├── commands/                     # Slash commands
│   ├── commit.md
│   ├── feature.md
│   ├── pr.md
│   ├── review.md
│   └── test.md
├── skills/                       # Advanced skills
│   ├── mui-components/
│   │   ├── SKILL.md
│   │   └── references/
│   ├── nextjs-api/
│   │   ├── SKILL.md
│   │   └── references/
│   └── playwright-e2e/
│       ├── SKILL.md
│       └── references/
├── hooks/
│   └── hooks.json               # Hook configuration
├── scripts/                      # Hook scripts
│   ├── auto-test.sh
│   ├── format-and-lint.sh
│   ├── log-bash-commands.sh
│   ├── pre-commit-validation.sh
│   └── protect-migrations.sh
└── README.md                     # This file
```

## ⚙️ Configuration

### Disabling Hooks

If you want to use the skills/commands but not the hooks:

```bash
# In your project's .claude/settings.json
{
  "disabledPluginHooks": ["fullstack-nextjs-plugin"]
}
```

### Customizing Hook Behavior

You can override specific hooks in your project settings to adjust timeouts or disable specific checks.

## 🔧 Development

### Testing Plugin Changes

When developing changes to this plugin:

```bash
# Test locally
claude --plugin-dir ./fullstack-nextjs-plugin

# Validate manifest
/plugin validate
```

### Updating the Plugin

After making changes:

1. Update version in `.claude-plugin/plugin.json`
2. Document changes in CHANGELOG.md
3. Test thoroughly with `--plugin-dir`
4. Commit and push to repository
5. Users can update with `/plugin update fullstack-nextjs-plugin`

## 📝 License

MIT

## 👤 Author

Dominic O'Toole

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📚 Learn More

- [Claude Code Documentation](https://code.claude.com/docs)
- [Next.js 16 Docs](https://nextjs.org/docs)
- [Playwright Testing](https://playwright.dev)
- [Material-UI](https://mui.com)
