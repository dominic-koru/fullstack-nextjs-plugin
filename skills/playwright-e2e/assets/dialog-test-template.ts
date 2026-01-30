/**
 * Dialog Test Template
 *
 * Template for testing dialog interactions including create/edit modes,
 * form validation, and complex multi-step dialogs.
 */

import { test, expect } from '@playwright/test';
import { t } from '../helpers/translations';

test.describe('Entity Dialog Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/entities');
  });

  test('should open create dialog when clicking create button', async ({ page }) => {
    // Dialog should not be visible initially
    const dialog = page.getByTestId('entity-dialog');
    await expect(dialog).not.toBeVisible();

    // Click create button
    await page.getByTestId('create-entity-button').click();

    // Dialog should appear
    await expect(dialog).toBeVisible();

    // Verify create mode title
    await expect(dialog.getByTestId('entity-dialog-title')).toHaveText(t.entities.create);

    // Verify empty form fields (use getByLabel for MUI TextField)
    const nameField = dialog.getByLabel(t.common.labels.name);
    await expect(nameField).toHaveValue('');
  });

  test('should open edit dialog with pre-filled data', async ({ page }) => {
    const uniqueId = Date.now();
    const entityName = `Test${uniqueId}`;
    const entityEmail = `test-${uniqueId}@example.com`;

    // Create an entity first
    await page.getByTestId('create-entity-button').click();
    let dialog = page.getByTestId('entity-dialog');
    await dialog.getByLabel(t.common.labels.name).fill(entityName);
    await dialog.getByLabel(t.common.labels.email).fill(entityEmail);
    await dialog.getByTestId('entity-dialog-save').click();
    await expect(dialog).not.toBeVisible();

    // Search and edit
    await page.getByTestId('entities-search-field').locator('input').fill(entityName);
    await page.waitForTimeout(500);

    const editButton = page.locator('[data-testid^="edit-entity-"]').first();
    await editButton.click();

    // Dialog should appear
    await expect(dialog).toBeVisible();

    // Verify edit mode title
    await expect(dialog.getByTestId('entity-dialog-title')).toHaveText(t.entities.edit);

    // Verify pre-filled fields
    await expect(dialog.getByLabel(t.common.labels.name)).toHaveValue(entityName);
    await expect(dialog.getByLabel(t.common.labels.email)).toHaveValue(entityEmail);
  });

  test('should close dialog when clicking cancel', async ({ page }) => {
    await page.getByTestId('create-entity-button').click();
    const dialog = page.getByTestId('entity-dialog');
    await expect(dialog).toBeVisible();

    // Click cancel
    await dialog.getByTestId('entity-dialog-cancel').click();

    // Dialog should close
    await expect(dialog).not.toBeVisible();
  });

  test('should close dialog when clicking backdrop (if enabled)', async ({ page }) => {
    await page.getByTestId('create-entity-button').click();
    const dialog = page.getByTestId('entity-dialog');
    await expect(dialog).toBeVisible();

    // Click outside dialog (on backdrop)
    // Note: This only works if your dialog allows backdrop clicks
    await page.mouse.click(10, 10);

    // Dialog should close
    await expect(dialog).not.toBeVisible();
  });

  test('should close dialog when pressing Escape key', async ({ page }) => {
    await page.getByTestId('create-entity-button').click();
    const dialog = page.getByTestId('entity-dialog');
    await expect(dialog).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    // Dialog should close
    await expect(dialog).not.toBeVisible();
  });

  test('should prevent closing dialog when form is submitting', async ({ page }) => {
    await page.getByTestId('create-entity-button').click();
    const dialog = page.getByTestId('entity-dialog');

    // Fill form
    await dialog.getByTestId('entity-name-field').fill('Submitting Entity');

    // Click save (which triggers submission)
    await dialog.getByTestId('entity-dialog-save').click();

    // Immediately try to close (might not work if save is in progress)
    // This depends on your implementation - some UIs disable cancel during save
    const cancelButton = dialog.getByTestId('entity-dialog-cancel');

    // If your UI disables buttons during save:
    // await expect(cancelButton).toBeDisabled();

    // Wait for submission to complete
    await expect(dialog).not.toBeVisible();
  });

  test('should clear form when opening create dialog multiple times', async ({ page }) => {
    // Open dialog first time
    await page.getByTestId('create-entity-button').click();
    let dialog = page.getByTestId('entity-dialog');

    // Fill some data
    await dialog.getByTestId('entity-name-field').fill('First Entity');

    // Close without saving
    await dialog.getByTestId('entity-dialog-cancel').click();
    await expect(dialog).not.toBeVisible();

    // Open dialog again
    await page.getByTestId('create-entity-button').click();
    await expect(dialog).toBeVisible();

    // Field should be empty
    await expect(dialog.getByTestId('entity-name-field')).toHaveValue('');
  });

  test('should show validation errors in dialog', async ({ page }) => {
    await page.getByTestId('create-entity-button').click();
    const dialog = page.getByTestId('entity-dialog');

    // Try to submit with invalid data (e.g., invalid email)
    await dialog.getByTestId('entity-name-field').fill('Valid Name');
    await dialog.getByTestId('entity-email-field').fill('invalid-email');

    await dialog.getByTestId('entity-dialog-save').click();

    // Dialog should still be visible
    await expect(dialog).toBeVisible();

    // Validation error should appear (if your implementation shows errors)
    // This depends on your specific validation approach
    // await expect(dialog.getByText('Invalid email format')).toBeVisible();
  });

  test('should handle multi-step dialog progression', async ({ page }) => {
    // For dialogs with multiple steps/tabs
    await page.getByTestId('create-entity-button').click();
    const dialog = page.getByTestId('entity-dialog');

    // Step 1: Basic info
    await dialog.getByTestId('entity-name-field').fill('Multi-step Entity');
    await dialog.getByTestId('dialog-next-button').click();

    // Verify we're on step 2
    await expect(dialog.getByTestId('dialog-step-indicator')).toHaveText('Step 2 of 3');

    // Step 2: Additional info
    await dialog.getByTestId('entity-description-field').fill('Description');
    await dialog.getByTestId('dialog-next-button').click();

    // Verify we're on step 3
    await expect(dialog.getByTestId('dialog-step-indicator')).toHaveText('Step 3 of 3');

    // Step 3: Confirmation
    await dialog.getByTestId('entity-dialog-save').click();

    // Dialog closes
    await expect(dialog).not.toBeVisible();
  });

  test('should allow going back in multi-step dialog', async ({ page }) => {
    await page.getByTestId('create-entity-button').click();
    const dialog = page.getByTestId('entity-dialog');

    // Go to step 2
    await dialog.getByTestId('entity-name-field').fill('Test');
    await dialog.getByTestId('dialog-next-button').click();

    // Go back to step 1
    await dialog.getByTestId('dialog-back-button').click();

    // Verify we're back on step 1
    await expect(dialog.getByTestId('dialog-step-indicator')).toHaveText('Step 1 of 3');

    // Data should be preserved
    await expect(dialog.getByTestId('entity-name-field')).toHaveValue('Test');
  });

  test('should handle confirmation dialog for destructive actions', async ({ page }) => {
    const uniqueId = Date.now();
    const entityName = `Delete${uniqueId}`;

    // Create entity to delete
    await page.getByTestId('create-entity-button').click();
    const createDialog = page.getByTestId('entity-dialog');
    await createDialog.getByLabel(t.common.labels.name).fill(entityName);
    await createDialog.getByTestId('entity-dialog-save').click();
    await expect(createDialog).not.toBeVisible();

    // Search for it
    await page.getByTestId('entities-search-field').locator('input').fill(entityName);
    await page.waitForTimeout(500);

    // Click delete
    const deleteButton = page.locator('[data-testid^="delete-entity-"]').first();
    await deleteButton.click();

    // Confirmation dialog should appear
    const confirmDialog = page.getByTestId('delete-entity-dialog');
    await expect(confirmDialog).toBeVisible();

    // Verify warning message
    await expect(confirmDialog).toContainText(entityName);

    // Verify action buttons
    await expect(confirmDialog.getByTestId('delete-dialog-cancel')).toBeVisible();
    await expect(confirmDialog.getByTestId('delete-dialog-confirm')).toBeVisible();

    // Confirm button should be styled for danger (typically red)
    // This checks the color attribute if your button has it
    const confirmButton = confirmDialog.getByTestId('delete-dialog-confirm');
    await expect(confirmButton).toHaveAttribute('color', 'error');
  });

  test('should focus first input when dialog opens', async ({ page }) => {
    await page.getByTestId('create-entity-button').click();
    const dialog = page.getByTestId('entity-dialog');

    // First input should be focused
    const nameField = dialog.getByTestId('entity-name-field');
    await expect(nameField).toBeFocused();
  });

  test('should trap focus within dialog', async ({ page }) => {
    await page.getByTestId('create-entity-button').click();
    const dialog = page.getByTestId('entity-dialog');

    // Tab through dialog elements
    await page.keyboard.press('Tab'); // Should move to next input
    await page.keyboard.press('Tab'); // Should move to save button
    await page.keyboard.press('Tab'); // Should move to cancel button
    await page.keyboard.press('Tab'); // Should wrap back to first input

    // Focus should be back on first input
    const nameField = dialog.getByTestId('entity-name-field');
    await expect(nameField).toBeFocused();
  });

  test('should show loading state during save', async ({ page }) => {
    await page.getByTestId('create-entity-button').click();
    const dialog = page.getByTestId('entity-dialog');

    await dialog.getByTestId('entity-name-field').fill('Test');

    const saveButton = dialog.getByTestId('entity-dialog-save');
    await saveButton.click();

    // Button should show loading text (if implemented)
    // await expect(saveButton).toHaveText(t.common.actions.saving);

    // Or button should be disabled
    // await expect(saveButton).toBeDisabled();
  });
});
