# Dialog Interaction Patterns

Patterns for testing dialog open/close, modes, and complex interactions.

## Open/Close Patterns

### Open Dialog

```typescript
test('open dialog', async ({ page }) => {
  await page.goto('/entities');

  const dialog = page.getByTestId('entity-dialog');
  await expect(dialog).not.toBeVisible();

  await page.getByTestId('create-entity-button').click();

  await expect(dialog).toBeVisible();
});
```

### Close via Cancel Button

```typescript
test('close with cancel', async ({ page }) => {
  await page.goto('/entities');
  await page.getByTestId('create-entity-button').click();

  const dialog = page.getByTestId('entity-dialog');
  await dialog.getByTestId('entity-dialog-cancel').click();

  await expect(dialog).not.toBeVisible();
});
```

### Close via Escape Key

```typescript
test('close with Escape', async ({ page }) => {
  await page.goto('/entities');
  await page.getByTestId('create-entity-button').click();

  const dialog = page.getByTestId('entity-dialog');
  await page.keyboard.press('Escape');

  await expect(dialog).not.toBeVisible();
});
```

### Close via Backdrop Click

```typescript
test('close with backdrop click', async ({ page }) => {
  await page.goto('/entities');
  await page.getByTestId('create-entity-button').click();

  const dialog = page.getByTestId('entity-dialog');

  // Click outside dialog (on backdrop)
  await page.mouse.click(10, 10);

  await expect(dialog).not.toBeVisible();
});
```

## Create vs Edit Mode

```typescript
test('distinguish create and edit modes', async ({ page }) => {
  await page.goto('/entities');

  // Create mode
  await page.getByTestId('create-entity-button').click();
  const dialog = page.getByTestId('entity-dialog');

  await expect(dialog.getByTestId('entity-dialog-title')).toHaveText(t.entities.create);
  await expect(dialog.getByTestId('entity-name-field')).toHaveValue('');

  await dialog.getByTestId('entity-name-field').fill('Test');
  await dialog.getByTestId('entity-dialog-save').click();
  await expect(dialog).not.toBeVisible();

  // Edit mode
  await page.getByTestId('entities-search-field').fill('Test');
  await page.waitForTimeout(500);

  await page.locator('[data-testid^="edit-entity-"]').first().click();

  await expect(dialog.getByTestId('entity-dialog-title')).toHaveText(t.entities.edit);
  await expect(dialog.getByTestId('entity-name-field')).toHaveValue('Test');
});
```

## Loading States

```typescript
test('show loading during save', async ({ page }) => {
  await page.goto('/entities');
  await page.getByTestId('create-entity-button').click();

  const dialog = page.getByTestId('entity-dialog');
  await dialog.getByTestId('entity-name-field').fill('Test');

  const saveButton = dialog.getByTestId('entity-dialog-save');
  await saveButton.click();

  // Button shows loading text (if implemented)
  // await expect(saveButton).toHaveText(t.common.actions.saving);

  // Or button is disabled
  // await expect(saveButton).toBeDisabled();

  // Eventually dialog closes
  await expect(dialog).not.toBeVisible();
});
```

## Multi-Step Dialogs

```typescript
test('navigate multi-step dialog', async ({ page }) => {
  await page.goto('/entities');
  await page.getByTestId('create-entity-button').click();

  const dialog = page.getByTestId('entity-dialog');

  // Step 1
  await expect(dialog.getByTestId('step-indicator')).toHaveText('Step 1 of 3');
  await dialog.getByTestId('entity-name-field').fill('Test');
  await dialog.getByTestId('next-button').click();

  // Step 2
  await expect(dialog.getByTestId('step-indicator')).toHaveText('Step 2 of 3');
  await dialog.getByTestId('entity-description-field').fill('Description');
  await dialog.getByTestId('next-button').click();

  // Step 3
  await expect(dialog.getByTestId('step-indicator')).toHaveText('Step 3 of 3');
  await dialog.getByTestId('save-button').click();

  await expect(dialog).not.toBeVisible();
});
```

## Confirmation Dialogs

```typescript
test('confirm destructive action', async ({ page }) => {
  await page.goto('/entities');

  // Create entity
  await page.getByTestId('create-entity-button').click();
  let dialog = page.getByTestId('entity-dialog');
  await dialog.getByTestId('entity-name-field').fill('To Delete');
  await dialog.getByTestId('entity-dialog-save').click();
  await expect(dialog).not.toBeVisible();

  // Delete with confirmation
  await page.getByTestId('entities-search-field').fill('To Delete');
  await page.waitForTimeout(500);

  await page.locator('[data-testid^="delete-entity-"]').first().click();

  const confirmDialog = page.getByTestId('delete-entity-dialog');
  await expect(confirmDialog).toBeVisible();
  await expect(confirmDialog).toContainText('To Delete');

  await confirmDialog.getByTestId('delete-dialog-confirm').click();
  await expect(confirmDialog).not.toBeVisible();
});
```

## Best Practices

1. **Test all close methods** (button, Escape, backdrop)
2. **Verify form resets** between opens
3. **Test both create and edit modes**
4. **Verify loading/disabled states** during saves
5. **Test focus management** (first field focused)
6. **Verify confirmation for destructive actions**
