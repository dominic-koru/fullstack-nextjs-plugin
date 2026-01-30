# CRUD Operation Patterns

Common patterns for testing Create, Read, Update, Delete operations.

## Create Pattern

```typescript
test('create entity', async ({ page }) => {
  // 1. IMPORTANT: Use unique IDs to avoid database conflicts
  const uniqueId = Date.now();
  const entityName = `New Entity ${uniqueId}`;
  const entityEmail = `new-${uniqueId}@example.com`;

  // 2. Navigate to entity list
  await page.goto('/entities');

  // 3. Open create dialog
  await page.getByTestId('create-entity-button').click();

  const dialog = page.getByTestId('entity-dialog');
  await expect(dialog).toBeVisible();

  // 4. Verify create mode
  await expect(dialog.getByTestId('entity-dialog-title')).toHaveText(t.entities.create);

  // 5. Fill form
  // BEST PRACTICE: Use getByLabel() for MUI TextField components
  await dialog.getByLabel(t.common.labels.name).fill(entityName);
  await dialog.getByLabel(t.common.labels.email).fill(entityEmail);

  // 6. Submit
  await dialog.getByTestId('entity-dialog-save').click();

  // 7. Verify dialog closed
  await expect(dialog).not.toBeVisible();

  // 8. Verify entity appears in list
  // NOTE: For MUI TextField with testid, access the input element
  await page.getByTestId('entities-search-field').locator('input').fill(entityName);
  await page.waitForTimeout(500);
  await expect(page.getByText(entityName)).toBeVisible();
});
```

## Read/List Pattern

```typescript
test('display entity list', async ({ page }) => {
  await page.goto('/entities');

  // Verify page title
  await expect(page.getByTestId('entities-page-title')).toHaveText(t.entities.title);

  // Verify UI elements exist
  await expect(page.getByTestId('create-entity-button')).toBeVisible();
  await expect(page.getByTestId('entities-search-field')).toBeVisible();
  await expect(page.getByTestId('pagination')).toBeVisible();
});
```

## Update Pattern

```typescript
test('edit entity', async ({ page }) => {
  // 1. Use unique IDs
  const uniqueId = Date.now();
  const originalName = `Original ${uniqueId}`;
  const updatedName = `Updated ${uniqueId}`;

  // 2. Create entity first
  await page.goto('/entities');
  await page.getByTestId('create-entity-button').click();
  const dialog = page.getByTestId('entity-dialog');
  await dialog.getByLabel(t.common.labels.name).fill(originalName);
  await dialog.getByTestId('entity-dialog-save').click();
  await expect(dialog).not.toBeVisible();

  // 3. Find and edit
  await page.getByTestId('entities-search-field').locator('input').fill(originalName);
  await page.waitForTimeout(500);

  const editButton = page.locator('[data-testid^="edit-entity-"]').first();
  await editButton.click();

  // 4. Verify edit mode
  await expect(dialog).toBeVisible();
  await expect(dialog.getByTestId('entity-dialog-title')).toHaveText(t.entities.edit);

  // 5. Verify pre-filled data
  const nameField = dialog.getByLabel(t.common.labels.name);
  await expect(nameField).toHaveValue(originalName);

  // 6. Update fields
  await nameField.clear();
  await nameField.fill(updatedName);

  // 7. Save
  await dialog.getByTestId('entity-dialog-save').click();
  await expect(dialog).not.toBeVisible();

  // 8. Search for updated name to verify
  await page.getByTestId('entities-search-field').locator('input').clear();
  await page.getByTestId('entities-search-field').locator('input').fill(updatedName);
  await page.waitForTimeout(500);

  // 9. Verify updated
  await expect(page.getByText(updatedName)).toBeVisible();
});
```

## Delete Pattern

```typescript
test('delete entity', async ({ page }) => {
  // 1. Use unique ID
  const uniqueId = Date.now();
  const entityName = `Delete ${uniqueId}`;

  // 2. Create entity
  await page.goto('/entities');
  await page.getByTestId('create-entity-button').click();
  const createDialog = page.getByTestId('entity-dialog');
  await createDialog.getByLabel(t.common.labels.name).fill(entityName);
  await createDialog.getByTestId('entity-dialog-save').click();
  await expect(createDialog).not.toBeVisible();

  // 3. Find entity
  await page.getByTestId('entities-search-field').locator('input').fill(entityName);
  await page.waitForTimeout(500);
  await expect(page.getByText(entityName)).toBeVisible();

  // 4. Click delete
  const deleteButton = page.locator('[data-testid^="delete-entity-"]').first();
  await deleteButton.click();

  // 5. Verify confirmation dialog
  const deleteDialog = page.getByTestId('delete-entity-dialog');
  await expect(deleteDialog).toBeVisible();
  await expect(deleteDialog.getByTestId('delete-entity-dialog-title')).toHaveText(
    t.entities.delete
  );

  // 6. Verify warning message
  await expect(deleteDialog).toContainText(entityName);

  // 7. Confirm deletion
  await deleteDialog.getByTestId('delete-dialog-confirm').click();

  // 8. Verify deleted
  await expect(deleteDialog).not.toBeVisible();
  await expect(page.getByText(entityName)).not.toBeVisible();
});
```

## Cancel Operation Pattern

```typescript
test('cancel create', async ({ page }) => {
  const uniqueId = Date.now();
  const entityName = `Cancelled ${uniqueId}`;

  await page.goto('/entities');

  // Open dialog
  await page.getByTestId('create-entity-button').click();
  const dialog = page.getByTestId('entity-dialog');

  // Fill data
  await dialog.getByLabel(t.common.labels.name).fill(entityName);

  // Cancel
  await dialog.getByTestId('entity-dialog-cancel').click();

  // Verify closed
  await expect(dialog).not.toBeVisible();

  // Verify not created
  await page.getByTestId('entities-search-field').locator('input').fill(entityName);
  await page.waitForTimeout(500);
  await expect(page.getByText(entityName)).not.toBeVisible();
});
```

## Best Practices

### 1. Create Test Data in Each Test

```typescript
// ✅ Good - self-contained
test('edit entity', async ({ page }) => {
  // Create the entity we'll edit
  await createTestEntity(page, 'Test Entity');

  // Now edit it
  await editEntity(page, 'Test Entity', 'Updated');
});

// ❌ Bad - depends on external state
test('edit entity', async ({ page }) => {
  // Assumes entity exists from previous test
  await editEntity(page, 'Test Entity', 'Updated');
});
```

### 2. CRITICAL: Always Use Unique IDs

**Why**: Tests run multiple times (locally, CI/CD, by different developers). Without unique IDs, you'll get database conflicts on unique constraints (email, slug, etc.).

```typescript
// ✅ BEST: Use Date.now() for unique IDs
const uniqueId = Date.now();
const entityName = `Test ${uniqueId}`;
const entityEmail = `test-${uniqueId}@example.com`;
const entitySlug = `test-${uniqueId}`;

// ⚠️ OK: If no unique constraints
const entityName = 'Entity To Edit';
const entityName = 'Should Be Deleted';

// ❌ BAD: Hardcoded values cause conflicts
const entityName = 'Test';
const entityEmail = 'test@example.com'; // Fails if already exists
const entitySlug = 'test-org'; // Unique constraint violation
```

### 3. Use getByLabel() for MUI TextField

**Best Practice**: Prefer `getByLabel()` over `getByTestId()` for MUI TextField components.

```typescript
// ✅ BEST: Use getByLabel (most reliable for MUI)
await dialog.getByLabel(t.common.labels.name).fill('Value');
await dialog.getByLabel(t.common.labels.email).fill('email@example.com');

// ⚠️ OK: Use getByTestId with .locator('input')
await dialog.getByTestId('entity-name-field').locator('input').fill('Value');

// ❌ FAILS: testid is on wrapper div, not input
await dialog.getByTestId('entity-name-field').fill('Value');
```

### 4. Access Input Element for Search Fields

```typescript
// ✅ CORRECT: Access input within testid wrapper
await page.getByTestId('entities-search-field').locator('input').fill('search term');

// ❌ FAILS: testid is on wrapper div
await page.getByTestId('entities-search-field').fill('search term');
```

### 5. Always Wait for Async Operations

```typescript
// ✅ Good - waits for dialog to close
await dialog.getByTestId('entity-dialog-save').click();
await expect(dialog).not.toBeVisible();
await expect(page.getByText('New Entity')).toBeVisible();

// ❌ Bad - doesn't wait
await dialog.getByTestId('entity-dialog-save').click();
await expect(page.getByText('New Entity')).toBeVisible(); // May fail
```

### 6. Verify Both Success and Cleanup

```typescript
// ✅ Good - verifies presence after create, absence after delete
test('delete entity', async ({ page }) => {
  await createEntity(page, 'To Delete');
  await expect(page.getByText('To Delete')).toBeVisible(); // Verify created

  await deleteEntity(page, 'To Delete');
  await expect(page.getByText('To Delete')).not.toBeVisible(); // Verify deleted
});
```

## Common Pitfalls

### 1. UUID-Based Selectors

```typescript
// ❌ Bad - UUIDs are unknown
await page.getByTestId('edit-entity-123e4567-e89b-12d3').click();

// ✅ Good - use prefix matching
await page.locator('[data-testid^="edit-entity-"]').first().click();

// ✅ Better - search for entity first, then get specific button
await page.getByTestId('entities-search-field').fill('My Entity');
await page.waitForTimeout(500);
const row = page.locator('[data-testid^="entity-row-"]').first();
await row.getByTestId(new RegExp('edit-entity-.*')).click();
```

### 2. Form Reset Issues

```typescript
// ⚠️ May fail if form doesn't reset between opens
test('form resets between opens', async ({ page }) => {
  await page.getByTestId('create-entity-button').click();
  const dialog = page.getByTestId('entity-dialog');

  await dialog.getByTestId('entity-name-field').fill('First');
  await dialog.getByTestId('entity-dialog-cancel').click();

  await page.getByTestId('create-entity-button').click();

  // Verify field is empty (not 'First')
  await expect(dialog.getByTestId('entity-name-field')).toHaveValue('');
});
```

### 3. Stale Element References

```typescript
// ❌ Bad - dialog reference may be stale after closing/reopening
const dialog = page.getByTestId('entity-dialog');
await dialog.getByTestId('entity-dialog-cancel').click();
await page.getByTestId('create-entity-button').click();
await dialog.getByTestId('entity-name-field').fill('Test'); // May fail

// ✅ Good - get fresh reference
await page.getByTestId('entity-dialog-cancel').click();
await page.getByTestId('create-entity-button').click();
const dialog = page.getByTestId('entity-dialog'); // Fresh reference
await dialog.getByTestId('entity-name-field').fill('Test');
```
