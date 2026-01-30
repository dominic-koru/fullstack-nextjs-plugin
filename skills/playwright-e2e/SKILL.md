# Playwright E2E Testing Skill

Comprehensive patterns and templates for end-to-end testing with Playwright using the hybrid approach (testid + translations).

## Overview

This skill provides:

- **Hybrid testing approach** - Resilient testids for interaction, translations for assertions
- **Test templates** - Ready-to-use patterns for common scenarios
- **Component patterns** - Standardized `data-testid` naming conventions
- **Translation helpers** - Load i18n files for validation
- **CI/CD integration** - Headless execution with reports

## Quick Reference

### The Hybrid Approach

**Principle**: Use `data-testid` for interaction, verify translations for assertions.

```typescript
import { test, expect } from '@playwright/test';
import { t } from './helpers/translations';

test('example test', async ({ page }) => {
  // ✅ Interact with testid (resilient)
  await page.getByTestId('create-button').click();

  // ✅ Verify translation (validates i18n)
  await expect(page.getByTestId('dialog-title')).toHaveText(t.common.actions.create);
});
```

**Why This Works**:

- Tests don't break when translations change
- Still validates i18n rendering
- Clear, maintainable selectors
- Accessibility-focused

## Component Test Identifier Patterns

### Buttons

```typescript
// Primary action buttons
data-testid="create-{entity}-button"    // e.g., create-organisation-button
data-testid="{action}-{entity}-button"  // e.g., save-organisation-button

// Action buttons in lists/tables
data-testid="{action}-{entity}-{id}"    // e.g., edit-organisation-123
aria-label={t('common:actions.{action}')}
```

### Form Fields

```typescript
// Input fields
data-testid="{entity}-{field}-field"    // e.g., organisation-name-field
label={t('{entity}:fields.{field}')}

// Autocomplete/Select
data-testid="{entity}-{field}-autocomplete"
data-testid="{entity}-{field}-autocomplete-input"
```

### Dialogs

```typescript
// Dialog container
data-testid="{entity}-dialog"

// Dialog parts
data-testid="{entity}-dialog-title"
data-testid="{entity}-dialog-save"
data-testid="{entity}-dialog-cancel"

// Confirmation dialogs
data-testid="delete-{entity}-dialog"
data-testid="delete-{entity}-dialog-title"
data-testid="delete-dialog-confirm"
data-testid="delete-dialog-cancel"
```

### Tables and Lists

```typescript
// Table rows
data-testid="{entity}-row-{id}"         // e.g., organisation-row-123

// Table cells with specific data
data-testid="{entity}-{field}-{id}"     // e.g., organisation-name-123

// List items
data-testid="{context}-{entity}-{id}"   // e.g., current-member-abc
```

### Search and Pagination

```typescript
// Search
data-testid="{entity}s-search-field"    // e.g., organisations-search-field

// Pagination
data-testid="pagination"
data-testid="pagination-info"
data-testid="items-per-page-select"
```

## MUI-Specific Patterns

### TextField Components

**IMPORTANT**: MUI TextField components have a special structure where `data-testid` is on the wrapper div, not the input element itself.

**Best Practice**: Use `getByLabel()` instead of `getByTestId()` for MUI TextField interactions.

```typescript
// ✅ BEST: Use getByLabel (most reliable for MUI)
await dialog.getByLabel(t.common.labels.name).fill('Test Organisation');
await dialog.getByLabel(t.organisations.fields.slug).fill('test-slug');

// ⚠️ OK: Use getByTestId with .locator('input')
await page.getByTestId('organisation-name-field').locator('input').fill('Test');

// ❌ FAILS: data-testid is on wrapper div, not input
await page.getByTestId('organisation-name-field').fill('Test'); // Error: not an input
```

**Why getByLabel() is better**:

- More resilient (works with MUI's component structure)
- Better accessibility testing (ensures labels are properly associated)
- Cleaner syntax (no need for `.locator('input')`)
- Follows Playwright best practices

### Checking TextField Attributes

For checking attributes like `placeholder`, you must access the input element:

```typescript
// ✅ CORRECT: Access input within testid wrapper
const searchField = page.getByTestId('organisations-search-field');
const input = searchField.locator('input');
await expect(input).toHaveAttribute(
  'placeholder',
  t.organisations.placeholders.searchOrganisations
);

// ❌ FAILS: wrapper div doesn't have placeholder
await expect(searchField).toHaveAttribute('placeholder', '...'); // Error
```

### Autocomplete Components

MUI Autocomplete requires special handling:

```typescript
// Open autocomplete
await page.getByTestId('role-selector-autocomplete').click();

// Select option
await page.getByRole('option', { name: 'Admin' }).click();

// Verify selection
const input = page.getByTestId('role-selector-autocomplete-input');
await expect(input).toHaveValue('admin');
```

## Database State Management

### Unique Test Data

**CRITICAL**: Always use unique identifiers in test data to avoid conflicts with existing database records.

```typescript
// ✅ GOOD: Use unique timestamps
test('create organisation', async ({ page }) => {
  const uniqueId = Date.now();
  const orgName = `Test Org ${uniqueId}`;
  const orgSlug = `test-org-${uniqueId}`;

  await dialog.getByLabel(t.common.labels.name).fill(orgName);
  await dialog.getByLabel(t.organisations.fields.slug).fill(orgSlug);
});

// ❌ BAD: Hardcoded values cause conflicts
test('create organisation', async ({ page }) => {
  await dialog.getByLabel(t.common.labels.name).fill('Test Org'); // May already exist
  await dialog.getByLabel(t.organisations.fields.slug).fill('test-org'); // Unique constraint violation
});
```

### Why This Matters

- Tests run multiple times (locally, CI/CD, by different developers)
- Database may not be cleared between runs
- Unique constraints (email, slug) will cause failures
- Tests should be idempotent and self-contained

### Pattern for Search Tests

When creating multiple entities for search tests:

```typescript
test('search organisations', async ({ page }) => {
  const uniqueId = Date.now();
  const apple = `Apple${uniqueId}`;
  const banana = `Banana${uniqueId}`;

  // Create first entity
  await createOrganisation(page, apple, `apple-${uniqueId}`);

  // Create second entity
  await createOrganisation(page, banana, `banana-${uniqueId}`);

  // Now search
  await page.getByTestId('search-field').locator('input').fill('Apple');
  await page.waitForTimeout(500);

  // Verify
  await expect(page.getByText(apple)).toBeVisible();
  await expect(page.getByText(banana)).not.toBeVisible();
});
```

## Translation Helper

### Setup

```typescript
// e2e/helpers/translations.ts
import commonEn from '../../src/lib/i18n/locales/en/common.json';
import organisationsEn from '../../src/lib/i18n/locales/en/organisations.json';
import usersEn from '../../src/lib/i18n/locales/en/users.json';

export const t = {
  common: commonEn,
  organisations: organisationsEn,
  users: usersEn,
};

export function translate(key: string): string {
  const [namespace, ...path] = key.split(':');
  const keys = path.join('.').split('.');

  let value: any = t[namespace as keyof typeof t];
  for (const k of keys) {
    value = value?.[k];
  }

  if (typeof value !== 'string') {
    throw new Error(`Translation key not found: ${key}`);
  }

  return value;
}
```

### Usage in Tests

```typescript
import { t, translate } from './helpers/translations';

// Direct access
await expect(element).toHaveText(t.common.actions.create);

// With helper function
await expect(element).toHaveText(translate('common:actions.create'));

// Verify placeholder
await expect(field).toHaveAttribute(
  'placeholder',
  t.organisations.placeholders.searchOrganisations
);
```

## Common Test Patterns

### CRUD Operations

See [crud-patterns.md](./references/crud-patterns.md) for:

- Create entity
- Edit entity
- Delete entity with confirmation
- Cancel operations

### Search and Filter

See [search-patterns.md](./references/search-patterns.md) for:

- Search with debounce
- Empty state handling
- Clear search
- No results state

### Form Validation

See [validation-patterns.md](./references/validation-patterns.md) for:

- Required field validation
- Format validation
- Error messages
- Conditional validation

### Dialog Interactions

See [dialog-patterns.md](./references/dialog-patterns.md) for:

- Open/close dialogs
- Create vs Edit modes
- Confirmation dialogs
- Multi-step dialogs

## Test Templates

### Basic CRUD Test

```typescript
// See assets/crud-test-template.ts
import { test, expect } from '@playwright/test';
import { t } from './helpers/translations';

test.describe('Entity CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/entities');
  });

  test('create entity', async ({ page }) => {
    // Template for create operation
  });

  test('edit entity', async ({ page }) => {
    // Template for edit operation
  });

  test('delete entity', async ({ page }) => {
    // Template for delete operation
  });
});
```

### Search Test

```typescript
// See assets/search-test-template.ts
test('search entities', async ({ page }) => {
  // Create test data
  // Perform search
  // Verify results
  // Test no results
});
```

## Best Practices

### 1. Independent Tests

Each test should be self-contained:

```typescript
// ✅ Good - creates own data
test('edit organisation', async ({ page }) => {
  // Create organisation to edit
  await page.getByTestId('create-organisation-button').click();
  // ... create it

  // Now edit it
  await page.getByTestId('edit-organisation-123').click();
  // ... edit it
});

// ❌ Bad - depends on previous test
test('edit organisation', async ({ page }) => {
  // Assumes organisation already exists
  await page.getByTestId('edit-organisation-123').click();
});
```

### 2. Wait for Async Operations

```typescript
// ✅ Good - wait for debounce
await page.getByTestId('search-field').fill('query');
await page.waitForTimeout(500); // Wait for 300ms debounce + buffer

// ✅ Good - wait for element
await expect(page.getByText('Result')).toBeVisible();

// ❌ Bad - no waiting
await page.getByTestId('search-field').fill('query');
await expect(page.getByText('Result')).toBeVisible(); // May fail
```

### 3. Use Specific Selectors

```typescript
// ✅ Good - specific testid
await page.getByTestId('create-organisation-button').click();

// ⚠️ OK - but less specific
await page.getByRole('button', { name: t.organisations.create }).click();

// ❌ Bad - too generic
await page.locator('button').first().click();
```

### 4. Test User Flows, Not Implementation

```typescript
// ✅ Good - tests what users do
test('user can create and edit organisation', async ({ page }) => {
  await page.goto('/organisations');
  await page.getByTestId('create-organisation-button').click();
  await page.getByTestId('organisation-name-field').fill('Acme');
  await page.getByTestId('organisation-dialog-save').click();
  await expect(page.getByText('Acme')).toBeVisible();
});

// ❌ Bad - tests implementation details
test('createOrganisation function is called', async ({ page }) => {
  // Testing function calls, not user experience
});
```

### 5. Use Unique Test Data

**CRITICAL**: Always use unique identifiers to avoid database conflicts.

```typescript
test('create organisation', async ({ page }) => {
  // ✅ Good - unique data every run
  const uniqueId = Date.now();
  const orgName = `Test Org ${uniqueId}`;
  const orgSlug = `test-org-${uniqueId}`;

  await dialog.getByLabel(t.common.labels.name).fill(orgName);
  await dialog.getByLabel(t.organisations.fields.slug).fill(orgSlug);

  // ❌ Bad - hardcoded values cause conflicts
  // await dialog.getByLabel(t.common.labels.name).fill('Test Org');
  // await dialog.getByLabel(t.organisations.fields.slug).fill('test-org');
});
```

### 6. Use getByLabel() for MUI TextField

**Best Practice**: Prefer `getByLabel()` over `getByTestId()` for MUI TextField components.

```typescript
// ✅ Good - works reliably with MUI
await dialog.getByLabel(t.common.labels.name).fill('Value');
await dialog.getByLabel(t.organisations.fields.slug).fill('value');

// ⚠️ OK - but more verbose
await page.getByTestId('organisation-name-field').locator('input').fill('Value');

// ❌ Bad - fails because testid is on wrapper div
await page.getByTestId('organisation-name-field').fill('Value');
```

## CI/CD Configuration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps chromium

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Debugging Tests

### UI Mode (Recommended)

```bash
npm run test:e2e:ui
```

Features:

- Watch tests run in real-time
- Time-travel debugging
- Inspect each step
- View screenshots and traces

### Headed Mode

```bash
npm run test:e2e:headed
```

Runs with browser window visible.

### Debug Single Test

```bash
npx playwright test organisations.spec.ts --debug
```

### View Trace Files

When tests fail in CI, download the trace and view it:

```bash
npx playwright show-trace trace.zip
```

## Running Tests

```bash
# All tests (headless)
npm run test:e2e

# Interactive UI mode
npm run test:e2e:ui

# Headed mode (see browser)
npm run test:e2e:headed

# Single file
npx playwright test organisations.spec.ts

# Single test
npx playwright test -g "create organisation"

# View report
npm run test:e2e:report
```

## Adding Test IDs to Components

### React Components

```typescript
// Button
<Button data-testid="create-organisation-button">
  {t('common:actions.create')}
</Button>

// Form field
<TextField
  label={t('organisations:fields.name')}
  data-testid="organisation-name-field"
/>

// Dialog
<Dialog open={open} data-testid="organisation-dialog">
  <DialogTitle data-testid="organisation-dialog-title">
    {title}
  </DialogTitle>
</Dialog>

// Table row
<TableRow data-testid={`organisation-row-${org.id}`}>
  <TableCell data-testid={`organisation-name-${org.id}`}>
    {org.name}
  </TableCell>
</TableRow>

// Icon button with aria-label
<IconButton
  onClick={handleEdit}
  aria-label={t('common:actions.edit')}
  data-testid={`edit-organisation-${org.id}`}
>
  <EditIcon />
</IconButton>
```

## Resources

### Templates

- [crud-test-template.ts](./assets/crud-test-template.ts) - CRUD operations
- [search-test-template.ts](./assets/search-test-template.ts) - Search and filter
- [dialog-test-template.ts](./assets/dialog-test-template.ts) - Dialog interactions

### References

- [crud-patterns.md](./references/crud-patterns.md) - CRUD operation patterns
- [search-patterns.md](./references/search-patterns.md) - Search and filter patterns
- [validation-patterns.md](./references/validation-patterns.md) - Form validation patterns
- [dialog-patterns.md](./references/dialog-patterns.md) - Dialog interaction patterns
- [accessibility-patterns.md](./references/accessibility-patterns.md) - Accessibility testing

### External Documentation

- [Playwright Docs](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Test Selectors](https://playwright.dev/docs/selectors)
