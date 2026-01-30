# React i18n Patterns Reference

Comprehensive patterns for internationalization with react-i18next in Next.js applications.

## Configuration

### i18next Setup

```typescript
// src/lib/i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import commonEn from './locales/en/common.json';
import organisationsEn from './locales/en/organisations.json';
import usersEn from './locales/en/users.json';

export const defaultNS = 'common';
export const resources = {
  en: {
    common: commonEn,
    organisations: organisationsEn,
    users: usersEn,
  },
} as const;

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  defaultNS,
  resources,
  interpolation: {
    escapeValue: false, // React already escapes
  },
});

export default i18n;
```

### TypeScript Type Safety

```typescript
// src/lib/i18n/types.ts
import 'i18next';
import type { resources, defaultNS } from './config';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: (typeof resources)['en'];
  }
}
```

---

## Component Patterns

### Basic Usage

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
    </Box>
  );
}
```

### Buttons and Actions

```typescript
// Standard action buttons
<Button>{t('common:actions.create')}</Button>
<Button>{t('common:actions.save')}</Button>
<Button>{t('common:actions.cancel')}</Button>
<Button>{t('common:actions.delete')}</Button>

// Loading state buttons
<Button disabled={loading}>
  {loading ? t('common:actions.saving') : t('common:actions.save')}
</Button>

// With icons
<Button startIcon={<AddIcon />}>
  {t('common:actions.create')}
</Button>
```

### Table Headers

```typescript
<TableHead>
  <TableRow>
    <TableCell>{t('common:labels.name')}</TableCell>
    <TableCell>{t('common:labels.email')}</TableCell>
    <TableCell>{t('common:labels.createdAt')}</TableCell>
    <TableCell align="right">{t('common:labels.actions')}</TableCell>
  </TableRow>
</TableHead>
```

### Form Fields

```typescript
<TextField
  label={t('organisations:fields.name')}
  placeholder={t('organisations:placeholders.name')}
  error={!!errors.name}
  helperText={errors.name?.message || t('organisations:messages.nameHelperText')}
/>

<TextField
  label={t('organisations:fields.slug')}
  placeholder={t('organisations:placeholders.slug')}
  helperText={t('organisations:messages.slugHelperText')}
/>
```

### Form Validation Errors

```typescript
// Display validation error from API
{error && (
  <Alert severity="error">
    {t('common:errors.validationFailed')}
  </Alert>
)}

// Field-level errors
<TextField
  error={!!fieldError}
  helperText={fieldError ? t(`common:validation.${fieldError.type}`) : undefined}
/>
```

### Empty States

```typescript
// Conditional empty state based on search
{items.length === 0 && (
  <TableRow>
    <TableCell colSpan={4} align="center">
      <Typography color="text.secondary">
        {searchQuery
          ? t('organisations:messages.noSearchResults')
          : t('organisations:messages.noOrganisations')}
      </Typography>
    </TableCell>
  </TableRow>
)}
```

### Confirmation Dialogs

```typescript
<Dialog open={deleteDialogOpen} onClose={handleCloseDelete}>
  <DialogTitle>{t('organisations:deleteTitle')}</DialogTitle>
  <DialogContent>
    <DialogContentText>
      {t('organisations:messages.deleteConfirm', { name: selectedItem?.name })}
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseDelete}>
      {t('common:actions.cancel')}
    </Button>
    <Button onClick={handleConfirmDelete} color="error">
      {t('common:actions.delete')}
    </Button>
  </DialogActions>
</Dialog>
```

### Create/Edit Dialog Titles

```typescript
<DialogTitle>
  {isEdit
    ? t('organisations:edit')
    : t('organisations:create')}
</DialogTitle>
```

### Pagination

```typescript
<Box display="flex" justifyContent="space-between" alignItems="center">
  <Typography variant="body2" color="text.secondary">
    {t('common:pagination.showing', {
      from: (page - 1) * limit + 1,
      to: Math.min(page * limit, total),
      total: total,
    })}
  </Typography>
  <Pagination
    count={Math.ceil(total / limit)}
    page={page}
    onChange={handlePageChange}
  />
</Box>
```

### Page Titles and Headers

```typescript
<Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
  <Typography variant="h4" component="h1">
    {t('organisations:title')}
  </Typography>
  <Button
    variant="contained"
    startIcon={<AddIcon />}
    onClick={handleCreate}
  >
    {t('organisations:create')}
  </Button>
</Box>
```

### Search Fields

```typescript
<TextField
  placeholder={t('organisations:placeholders.search')}
  value={searchQuery}
  onChange={handleSearchChange}
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <SearchIcon />
      </InputAdornment>
    ),
  }}
/>
```

### Loading States

```typescript
{loading ? (
  <Box display="flex" justifyContent="center" p={4}>
    <CircularProgress />
    <Typography ml={2}>{t('common:messages.loading')}</Typography>
  </Box>
) : (
  // Content
)}
```

### Error Messages

```typescript
{error && (
  <Alert severity="error" sx={{ mb: 2 }}>
    {t('common:errors.loadFailed')}
  </Alert>
)}
```

### Success Messages (Snackbar)

```typescript
<Snackbar
  open={snackbarOpen}
  autoHideDuration={6000}
  onClose={handleSnackbarClose}
>
  <Alert severity="success">
    {t('organisations:messages.createSuccess')}
  </Alert>
</Snackbar>
```

---

## Translation File Structure

### common.json

```json
{
  "actions": {
    "create": "Create",
    "edit": "Edit",
    "delete": "Delete",
    "save": "Save",
    "saving": "Saving...",
    "cancel": "Cancel",
    "close": "Close",
    "confirm": "Confirm",
    "search": "Search",
    "clear": "Clear",
    "refresh": "Refresh"
  },
  "labels": {
    "name": "Name",
    "email": "Email",
    "actions": "Actions",
    "createdAt": "Created At",
    "updatedAt": "Updated At",
    "status": "Status"
  },
  "messages": {
    "loading": "Loading...",
    "noData": "No data available"
  },
  "pagination": {
    "showing": "Showing {{from}}-{{to}} of {{total}}",
    "itemsPerPage": "Items per page",
    "page": "Page {{page}} of {{totalPages}}"
  },
  "errors": {
    "loadFailed": "Failed to load data",
    "saveFailed": "Failed to save",
    "deleteFailed": "Failed to delete",
    "validationFailed": "Please fix the errors below",
    "networkError": "Network error. Please try again.",
    "unexpectedError": "An unexpected error occurred"
  },
  "validation": {
    "required": "This field is required",
    "email": "Please enter a valid email address",
    "minLength": "Must be at least {{min}} characters",
    "maxLength": "Must be no more than {{max}} characters"
  }
}
```

### Feature-specific (e.g., organisations.json)

```json
{
  "title": "Organisations",
  "create": "Create Organisation",
  "edit": "Edit Organisation",
  "deleteTitle": "Delete Organisation",
  "fields": {
    "name": "Organisation Name",
    "slug": "Slug"
  },
  "placeholders": {
    "name": "Enter organisation name",
    "slug": "enter-slug-here",
    "search": "Search organisations..."
  },
  "messages": {
    "noOrganisations": "No organisations yet. Create your first one!",
    "noSearchResults": "No organisations match your search",
    "deleteConfirm": "Are you sure you want to delete \"{{name}}\"? This action cannot be undone.",
    "createSuccess": "Organisation created successfully",
    "updateSuccess": "Organisation updated successfully",
    "deleteSuccess": "Organisation deleted successfully",
    "slugHelperText": "URL-friendly identifier (lowercase, numbers, hyphens only)"
  }
}
```

---

## Adding New Translations

When adding a new feature:

1. **Create namespace file** if needed:
   ```
   src/lib/i18n/locales/en/[feature].json
   ```

2. **Add translations** following the naming patterns above

3. **Import in config**:
   ```typescript
   // src/lib/i18n/config.ts
   import featureEn from './locales/en/feature.json';

   export const resources = {
     en: {
       // ...existing
       feature: featureEn,
     },
   } as const;
   ```

4. **Use in components**:
   ```typescript
   const { t } = useTranslation(['feature', 'common']);
   ```

---

## E2E Testing with Translations

Load translations directly in Playwright tests for assertions:

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
await expect(dialog).toContainText(t.organisations.create);
```

---

## Best Practices

1. **Namespace per feature** - Keep translations organized and manageable
2. **Shared common namespace** - Avoid duplicating common terms
3. **Consistent key naming** - Follow the actions/labels/messages/placeholders/errors pattern
4. **Interpolation for dynamic values** - Never concatenate strings
5. **Type safety** - Configure TypeScript to catch invalid keys
6. **Test with translations** - Verify correct text renders in E2E tests
