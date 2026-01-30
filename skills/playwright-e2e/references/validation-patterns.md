# Form Validation Patterns

Patterns for testing form validation, required fields, format validation, and error messages.

## Required Field Validation

```typescript
test('validate required fields', async ({ page }) => {
  await page.goto('/entities');
  await page.getByTestId('create-entity-button').click();

  const dialog = page.getByTestId('entity-dialog');

  // Try to submit without filling required fields
  await dialog.getByTestId('entity-dialog-save').click();

  // Dialog should still be visible (browser validation prevents submission)
  await expect(dialog).toBeVisible();

  // Fill required field
  await dialog.getByTestId('entity-name-field').fill('Valid Name');

  // Now submission should work
  await dialog.getByTestId('entity-dialog-save').click();
  await expect(dialog).not.toBeVisible();
});
```

## Format Validation (Email, URL, etc.)

```typescript
test('validate email format', async ({ page }) => {
  await page.goto('/entities');
  await page.getByTestId('create-entity-button').click();

  const dialog = page.getByTestId('entity-dialog');

  // Fill with invalid email
  await dialog.getByTestId('entity-name-field').fill('Test');
  await dialog.getByTestId('entity-email-field').fill('invalid-email');

  // Try to submit
  await dialog.getByTestId('entity-dialog-save').click();

  // Dialog should remain open (validation failed)
  await expect(dialog).toBeVisible();

  // Error message should appear (if your implementation shows it)
  // await expect(dialog.getByText('Invalid email format')).toBeVisible();
});
```

## Auto-Generated Fields

```typescript
test('auto-generate slug from name', async ({ page }) => {
  await page.goto('/organisations');
  await page.getByTestId('create-organisation-button').click();

  const dialog = page.getByTestId('organisation-dialog');

  // Type in name field
  await dialog.getByTestId('organisation-name-field').fill('My Organisation');

  // Verify slug auto-generates
  await expect(dialog.getByTestId('organisation-slug-field')).toHaveValue('my-organisation');
});
```

## Character Limits

```typescript
test('enforce maximum length', async ({ page }) => {
  await page.goto('/entities');
  await page.getByTestId('create-entity-button').click();

  const dialog = page.getByTestId('entity-dialog');
  const nameField = dialog.getByTestId('entity-name-field');

  // Try to exceed max length (e.g., 255 characters)
  const longName = 'a'.repeat(300);
  await nameField.fill(longName);

  // Field should truncate or prevent input
  const value = await nameField.inputValue();
  expect(value.length).toBeLessThanOrEqual(255);
});
```

## Pattern Validation (Regex)

```typescript
test('validate slug pattern', async ({ page }) => {
  await page.goto('/organisations');
  await page.getByTestId('create-organisation-button').click();

  const dialog = page.getByTestId('organisation-dialog');

  // Fill with valid slug
  await dialog.getByTestId('organisation-name-field').fill('Test');
  await dialog.getByTestId('organisation-slug-field').clear();
  await dialog.getByTestId('organisation-slug-field').fill('valid-slug-123');

  await dialog.getByTestId('organisation-dialog-save').click();
  await expect(dialog).not.toBeVisible();

  // Try with invalid slug (uppercase, spaces, special chars)
  await page.getByTestId('create-organisation-button').click();
  await dialog.getByTestId('organisation-name-field').fill('Test 2');
  await dialog.getByTestId('organisation-slug-field').clear();
  await dialog.getByTestId('organisation-slug-field').fill('Invalid Slug!');

  await dialog.getByTestId('organisation-dialog-save').click();

  // Should fail validation
  await expect(dialog).toBeVisible();
});
```

## Conditional Validation

```typescript
test('validate conditionally required fields', async ({ page }) => {
  await page.goto('/entities');
  await page.getByTestId('create-entity-button').click();

  const dialog = page.getByTestId('entity-dialog');

  // Select option that makes another field required
  await dialog.getByTestId('entity-type-select').selectOption('company');

  // Now company-specific field is required
  await dialog.getByTestId('entity-name-field').fill('Test');
  await dialog.getByTestId('entity-dialog-save').click();

  // Should fail because company number is required
  await expect(dialog).toBeVisible();

  // Fill the conditional field
  await dialog.getByTestId('entity-company-number-field').fill('12345');
  await dialog.getByTestId('entity-dialog-save').click();

  // Should succeed
  await expect(dialog).not.toBeVisible();
});
```

## Real-Time Validation

```typescript
test('show validation errors in real-time', async ({ page }) => {
  await page.goto('/entities');
  await page.getByTestId('create-entity-button').click();

  const dialog = page.getByTestId('entity-dialog');
  const emailField = dialog.getByTestId('entity-email-field');

  // Type invalid email
  await emailField.fill('invalid');

  // Error should appear (if your implementation shows real-time errors)
  // await expect(dialog.getByText('Invalid email')).toBeVisible();

  // Type valid email
  await emailField.clear();
  await emailField.fill('valid@example.com');

  // Error should disappear
  // await expect(dialog.getByText('Invalid email')).not.toBeVisible();
});
```

## Best Practices

1. **Test both valid and invalid inputs**
2. **Verify error messages are clear and helpful**
3. **Test browser-native validation (required, email, etc.)**
4. **Test custom validation logic**
5. **Verify validation doesn't block valid submissions**
6. **Test field interactions (conditional requirements)**
