# React i18n Skill

**Purpose**: Provide expertise for implementing internationalization with react-i18next in Next.js applications.

**When to Apply**: When creating or modifying components with user-facing text, or working with translation files in `src/lib/i18n/**/*`.

---

## Core Principles

1. **No Hardcoded Strings**: All user-facing text must use `t()`
2. **Namespace Organization**: Group translations by feature
3. **Type Safety**: TypeScript validation for translation keys
4. **Consistent Patterns**: Follow established naming conventions
5. **Interpolation**: Use variables for dynamic content

---

## Critical Rules

1. **NEVER use hardcoded strings** - All user-facing text must use `t()`
2. **Load namespaces** - `const { t } = useTranslation(['feature', 'common'])`
3. **Add to catalogs first** - Add keys to JSON files before using them
4. **Use interpolation** - For dynamic values: `t('key', { value: dynamic })`

---

## Quick Reference

### Basic Component Usage

```typescript
'use client';

import { useTranslation } from 'react-i18next';

export default function MyPage() {
  // Load multiple namespaces
  const { t } = useTranslation(['feature', 'common']);

  return (
    <Box>
      {/* Namespace-prefixed keys */}
      <Typography>{t('feature:title')}</Typography>

      {/* With interpolation */}
      <Typography>
        {t('common:pagination.showing', { from: 1, to: 10, total: 100 })}
      </Typography>

      {/* Conditional messages */}
      <Typography>
        {searchQuery
          ? t('feature:messages.noSearchResults')
          : t('feature:messages.noItems')}
      </Typography>
    </Box>
  );
}
```

---

## File Structure

```
src/lib/i18n/
├── config.ts              # i18next configuration
├── types.ts               # TypeScript type declarations
└── locales/
    └── en/                # English translations
        ├── common.json    # Shared translations (actions, labels, messages)
        ├── organisations.json
        ├── users.json
        └── [feature].json # Feature-specific translations
```

---

## Namespace Organization

- **common** - Shared translations (actions, labels, validation, pagination)
- **[feature]** - Feature-specific translations (organisations, users, etc.)

---

## Key Naming Conventions

```json
{
  "actions": { "create": "Create", "edit": "Edit", "delete": "Delete" },
  "labels": { "name": "Name", "email": "Email" },
  "fields": { "organisationName": "Organisation Name" },
  "messages": { "deleteConfirm": "Are you sure you want to delete \"{{name}}\"?" },
  "placeholders": { "search": "Search..." },
  "errors": { "loadFailed": "Failed to load data" }
}
```

---

## Common Patterns

### Buttons

```typescript
<Button>{t('common:actions.create')}</Button>
<Button disabled={loading}>
  {loading ? t('common:actions.saving') : t('common:actions.save')}
</Button>
```

### Form Fields

```typescript
<TextField
  label={t('organisations:fields.name')}
  placeholder={t('organisations:placeholders.name')}
  helperText={t('organisations:messages.nameHelperText')}
/>
```

### Confirmation Dialogs

```typescript
<DialogTitle>{t('organisations:deleteTitle')}</DialogTitle>
<DialogContentText>
  {t('organisations:messages.deleteConfirm', { name: item.name })}
</DialogContentText>
```

### Empty States

```typescript
{items.length === 0 && (
  <Typography>
    {searchQuery
      ? t('organisations:messages.noSearchResults')
      : t('organisations:messages.noOrganisations')}
  </Typography>
)}
```

### Pagination

```typescript
<Typography>
  {t('common:pagination.showing', {
    from: (page - 1) * limit + 1,
    to: Math.min(page * limit, total),
    total: total,
  })}
</Typography>
```

---

## Adding New Translations

1. **Create namespace file** if needed: `src/lib/i18n/locales/en/[feature].json`
2. **Add translations** following the naming patterns
3. **Import in config**: Update `src/lib/i18n/config.ts`
4. **Use in components**: `const { t } = useTranslation(['feature', 'common'])`

---

## E2E Testing

Load translations directly in Playwright tests:

```typescript
// e2e/helpers/translations.ts
import commonEn from '../../src/lib/i18n/locales/en/common.json';
import organisationsEn from '../../src/lib/i18n/locales/en/organisations.json';

export const t = {
  common: commonEn,
  organisations: organisationsEn,
};

// Usage in tests
await expect(element).toHaveText(t.common.actions.create);
```

---

## References

- `references/patterns.md` - Comprehensive component patterns
- `references/config.md` - Configuration and TypeScript setup

---

## Common Pitfalls

1. **Hardcoded strings** - Always use `t()` for user-facing text
2. **Missing namespace** - Load all required namespaces in `useTranslation`
3. **String concatenation** - Use interpolation instead
4. **Missing keys** - Add to JSON files before using in code
5. **Forgetting 'use client'** - Required for hooks in Next.js App Router
