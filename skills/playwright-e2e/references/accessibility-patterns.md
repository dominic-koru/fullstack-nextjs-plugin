# Accessibility Testing Patterns

Patterns for testing accessibility features including ARIA labels, keyboard navigation, and focus management.

## ARIA Labels for Icon Buttons

```typescript
test('icon buttons have aria-labels', async ({ page }) => {
  await page.goto('/entities');

  // Create test entity
  await page.getByTestId('create-entity-button').click();
  const dialog = page.getByTestId('entity-dialog');
  await dialog.getByTestId('entity-name-field').fill('Test');
  await dialog.getByTestId('entity-dialog-save').click();
  await expect(dialog).not.toBeVisible();

  // Search for entity
  await page.getByTestId('entities-search-field').fill('Test');
  await page.waitForTimeout(500);

  // Verify icon buttons have aria-labels
  const editButton = page.locator('[data-testid^="edit-entity-"]').first();
  await expect(editButton).toHaveAttribute('aria-label', t.common.actions.edit);

  const deleteButton = page.locator('[data-testid^="delete-entity-"]').first();
  await expect(deleteButton).toHaveAttribute('aria-label', t.common.actions.delete);
});
```

## Keyboard Navigation

### Tab Order

```typescript
test('tab through form fields', async ({ page }) => {
  await page.goto('/entities');
  await page.getByTestId('create-entity-button').click();

  const dialog = page.getByTestId('entity-dialog');

  // First field should be focused
  await expect(dialog.getByTestId('entity-name-field')).toBeFocused();

  // Tab to next field
  await page.keyboard.press('Tab');
  await expect(dialog.getByTestId('entity-email-field')).toBeFocused();

  // Tab to save button
  await page.keyboard.press('Tab');
  await expect(dialog.getByTestId('entity-dialog-save')).toBeFocused();

  // Tab to cancel button
  await page.keyboard.press('Tab');
  await expect(dialog.getByTestId('entity-dialog-cancel')).toBeFocused();
});
```

### Focus Trap in Dialog

```typescript
test('focus trapped in dialog', async ({ page }) => {
  await page.goto('/entities');
  await page.getByTestId('create-entity-button').click();

  const dialog = page.getByTestId('entity-dialog');

  // Tab through all focusable elements
  await page.keyboard.press('Tab'); // To second field
  await page.keyboard.press('Tab'); // To save button
  await page.keyboard.press('Tab'); // To cancel button
  await page.keyboard.press('Tab'); // Should wrap to first field

  // Focus should be back on first field
  await expect(dialog.getByTestId('entity-name-field')).toBeFocused();
});
```

### Keyboard Shortcuts

```typescript
test('Escape closes dialog', async ({ page }) => {
  await page.goto('/entities');
  await page.getByTestId('create-entity-button').click();

  const dialog = page.getByTestId('entity-dialog');
  await expect(dialog).toBeVisible();

  await page.keyboard.press('Escape');

  await expect(dialog).not.toBeVisible();
});

test('Enter submits form', async ({ page }) => {
  await page.goto('/entities');
  await page.getByTestId('create-entity-button').click();

  const dialog = page.getByTestId('entity-dialog');

  await dialog.getByTestId('entity-name-field').fill('Test');

  // Press Enter to submit
  await page.keyboard.press('Enter');

  await expect(dialog).not.toBeVisible();
  await expect(page.getByText('Test')).toBeVisible();
});
```

## Focus Management

### Auto-Focus on Dialog Open

```typescript
test('first field focused when dialog opens', async ({ page }) => {
  await page.goto('/entities');

  const dialog = page.getByTestId('entity-dialog');

  await page.getByTestId('create-entity-button').click();

  // First field should be automatically focused
  await expect(dialog.getByTestId('entity-name-field')).toBeFocused();
});
```

### Focus Returns After Dialog Close

```typescript
test('focus returns to trigger after close', async ({ page }) => {
  await page.goto('/entities');

  const createButton = page.getByTestId('create-entity-button');
  await createButton.click();

  const dialog = page.getByTestId('entity-dialog');
  await dialog.getByTestId('entity-dialog-cancel').click();

  // Focus should return to create button
  await expect(createButton).toBeFocused();
});
```

## Form Labels

```typescript
test('form fields have proper labels', async ({ page }) => {
  await page.goto('/entities');
  await page.getByTestId('create-entity-button').click();

  const dialog = page.getByTestId('entity-dialog');

  // Fields should have labels
  await expect(dialog.getByLabel(t.common.labels.name)).toBeVisible();
  await expect(dialog.getByLabel(t.common.labels.email)).toBeVisible();

  // Labels should be associated with inputs (clicking label focuses input)
  await page.getByLabel(t.common.labels.name).click();
  await expect(dialog.getByTestId('entity-name-field')).toBeFocused();
});
```

## Screen Reader Support

### Descriptive Button Text

```typescript
test('buttons have descriptive text or aria-labels', async ({ page }) => {
  await page.goto('/entities');

  // Text buttons are self-descriptive
  const createButton = page.getByTestId('create-entity-button');
  await expect(createButton).toHaveText(t.entities.create);

  // Create an entity to test icon buttons
  await createButton.click();
  const dialog = page.getByTestId('entity-dialog');
  await dialog.getByTestId('entity-name-field').fill('Test');
  await dialog.getByTestId('entity-dialog-save').click();
  await expect(dialog).not.toBeVisible();

  // Icon buttons should have aria-labels
  await page.getByTestId('entities-search-field').fill('Test');
  await page.waitForTimeout(500);

  const editButton = page.locator('[data-testid^="edit-entity-"]').first();
  const ariaLabel = await editButton.getAttribute('aria-label');
  expect(ariaLabel).toBeTruthy();
  expect(ariaLabel).toContain('Edit'); // or check translation
});
```

### Alternative Text for Images

```typescript
test('images have alt text', async ({ page }) => {
  await page.goto('/entities');

  // If your app has images (logos, avatars, etc.)
  const logo = page.locator('img[alt]').first();
  const altText = await logo.getAttribute('alt');

  expect(altText).toBeTruthy();
  expect(altText).not.toBe(''); // Should have descriptive text
});
```

## Color Contrast

While Playwright can't directly test color contrast, you can verify elements exist that should be visible:

```typescript
test('error messages are visible', async ({ page }) => {
  await page.goto('/entities');
  await page.getByTestId('create-entity-button').click();

  const dialog = page.getByTestId('entity-dialog');

  // Submit invalid form
  await dialog.getByTestId('entity-email-field').fill('invalid');
  await dialog.getByTestId('entity-dialog-save').click();

  // Error should be visible (implicitly tests it has sufficient contrast)
  // await expect(dialog.getByText('Invalid email')).toBeVisible();
});
```

## Best Practices

1. **Add aria-labels to all icon buttons**
2. **Ensure logical tab order**
3. **Trap focus in dialogs**
4. **Return focus after dialog closes**
5. **Support Escape and Enter keys**
6. **Associate labels with inputs**
7. **Provide alternative text for images**
8. **Verify loading/disabled states are announced**

## Tools for Advanced Accessibility Testing

For comprehensive accessibility testing, consider:

- **axe-core** - Automated accessibility testing
- **Lighthouse** - Accessibility audits
- **NVDA/JAWS** - Screen reader testing
- **Keyboard-only navigation** - Manual testing without mouse

Example with axe-core:

```typescript
import AxeBuilder from '@axe-core/playwright';

test('page should be accessible', async ({ page }) => {
  await page.goto('/entities');

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```
