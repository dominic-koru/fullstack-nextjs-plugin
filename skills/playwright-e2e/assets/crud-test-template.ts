/**
 * CRUD Test Template
 *
 * Template for testing Create, Read, Update, Delete operations on an entity.
 * Replace 'entity' with your actual entity name (e.g., organisation, user, etc.)
 */

import { test, expect } from '@playwright/test';
import { t } from '../helpers/translations';

test.describe('Entity CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to entity list page
    await page.goto('/entities');
  });

  test('should display entity list page', async ({ page }) => {
    // Verify page title
    const title = page.getByTestId('entities-page-title');
    await expect(title).toBeVisible();
    await expect(title).toHaveText(t.entities.title);

    // Verify create button exists
    await expect(page.getByTestId('create-entity-button')).toBeVisible();

    // Verify search field exists
    await expect(page.getByTestId('entities-search-field')).toBeVisible();
  });

  test('should create a new entity', async ({ page }) => {
    // IMPORTANT: Use unique IDs to avoid database conflicts
    const uniqueId = Date.now();
    const entityName = `Test Entity ${uniqueId}`;
    const entityEmail = `test-${uniqueId}@example.com`;

    // Click create button
    await page.getByTestId('create-entity-button').click();

    // Verify dialog opened
    const dialog = page.getByTestId('entity-dialog');
    await expect(dialog).toBeVisible();

    // Verify dialog title (Create mode)
    await expect(dialog.getByTestId('entity-dialog-title')).toHaveText(t.entities.create);

    // Fill in required fields
    // BEST PRACTICE: Use getByLabel() for MUI TextField components
    await dialog.getByLabel(t.common.labels.name).fill(entityName);
    await dialog.getByLabel(t.common.labels.email).fill(entityEmail);
    // Add more fields as needed

    // Submit form
    await dialog.getByTestId('entity-dialog-save').click();

    // Wait for dialog to close
    await expect(dialog).not.toBeVisible();

    // Verify entity appears in the list
    // Search for it to ensure it's there
    // NOTE: For search field with testid, access input element
    await page.getByTestId('entities-search-field').locator('input').fill(entityName);
    await page.waitForTimeout(500); // Wait for debounce

    // Verify entity is visible
    await expect(page.getByText(entityName)).toBeVisible();
  });

  test('should edit an existing entity', async ({ page }) => {
    // Use unique IDs to avoid conflicts
    const uniqueId = Date.now();
    const originalName = `Original ${uniqueId}`;
    const updatedName = `Updated ${uniqueId}`;

    // First, create an entity to edit
    await page.getByTestId('create-entity-button').click();
    const dialog = page.getByTestId('entity-dialog');
    await dialog.getByLabel(t.common.labels.name).fill(originalName);
    await dialog.getByTestId('entity-dialog-save').click();
    await expect(dialog).not.toBeVisible();

    // Search for the entity
    await page.getByTestId('entities-search-field').locator('input').fill(originalName);
    await page.waitForTimeout(500);

    // Verify it exists
    await expect(page.getByText(originalName)).toBeVisible();

    // Click edit button
    // Since we don't know the UUID, use a selector that finds the first edit button
    const editButton = page.locator('[data-testid^="edit-entity-"]').first();
    await editButton.click();

    // Verify dialog opened in edit mode
    await expect(dialog).toBeVisible();
    await expect(dialog.getByTestId('entity-dialog-title')).toHaveText(t.entities.edit);

    // Update the name using getByLabel()
    const nameField = dialog.getByLabel(t.common.labels.name);
    await expect(nameField).toHaveValue(originalName);
    await nameField.clear();
    await nameField.fill(updatedName);

    // Save changes
    await dialog.getByTestId('entity-dialog-save').click();
    await expect(dialog).not.toBeVisible();

    // Search for updated name to verify
    await page.getByTestId('entities-search-field').locator('input').clear();
    await page.getByTestId('entities-search-field').locator('input').fill(updatedName);
    await page.waitForTimeout(500);

    // Verify updated name appears
    await expect(page.getByText(updatedName)).toBeVisible();
  });

  test('should delete an entity with confirmation', async ({ page }) => {
    // Use unique ID
    const uniqueId = Date.now();
    const entityName = `Delete Test ${uniqueId}`;

    // First, create an entity to delete
    await page.getByTestId('create-entity-button').click();
    const createDialog = page.getByTestId('entity-dialog');
    await createDialog.getByLabel(t.common.labels.name).fill(entityName);
    await createDialog.getByTestId('entity-dialog-save').click();
    await expect(createDialog).not.toBeVisible();

    // Search for the entity
    await page.getByTestId('entities-search-field').locator('input').fill(entityName);
    await page.waitForTimeout(500);

    // Verify it exists
    await expect(page.getByText(entityName)).toBeVisible();

    // Click delete button
    const deleteButton = page.locator('[data-testid^="delete-entity-"]').first();
    await deleteButton.click();

    // Verify delete confirmation dialog
    const deleteDialog = page.getByTestId('delete-entity-dialog');
    await expect(deleteDialog).toBeVisible();
    await expect(deleteDialog.getByTestId('delete-entity-dialog-title')).toHaveText(
      t.entities.delete
    );

    // Verify confirmation message mentions the entity name
    await expect(deleteDialog).toContainText(entityName);

    // Confirm deletion
    await deleteDialog.getByTestId('delete-dialog-confirm').click();

    // Wait for dialog to close
    await expect(deleteDialog).not.toBeVisible();

    // Verify entity is no longer in the list
    await expect(page.getByText(entityName)).not.toBeVisible();
  });

  test('should cancel entity creation', async ({ page }) => {
    const uniqueId = Date.now();
    const entityName = `Cancelled ${uniqueId}`;

    // Click create button
    await page.getByTestId('create-entity-button').click();

    const dialog = page.getByTestId('entity-dialog');
    await expect(dialog).toBeVisible();

    // Fill in some data
    await dialog.getByLabel(t.common.labels.name).fill(entityName);

    // Click cancel
    await dialog.getByTestId('entity-dialog-cancel').click();

    // Dialog should close
    await expect(dialog).not.toBeVisible();

    // Entity should not be created
    await page.getByTestId('entities-search-field').locator('input').fill(entityName);
    await page.waitForTimeout(500);
    await expect(page.getByText(entityName)).not.toBeVisible();
  });

  test('should cancel entity deletion', async ({ page }) => {
    const uniqueId = Date.now();
    const entityName = `Keep ${uniqueId}`;

    // Create an entity
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

    // Verify delete dialog
    const deleteDialog = page.getByTestId('delete-entity-dialog');
    await expect(deleteDialog).toBeVisible();

    // Cancel deletion
    await deleteDialog.getByTestId('delete-dialog-cancel').click();

    // Dialog closes
    await expect(deleteDialog).not.toBeVisible();

    // Entity still exists
    await expect(page.getByText(entityName)).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    const uniqueId = Date.now();
    const entityName = `Valid ${uniqueId}`;

    // Click create button
    await page.getByTestId('create-entity-button').click();

    const dialog = page.getByTestId('entity-dialog');

    // Try to submit without filling required fields
    await dialog.getByTestId('entity-dialog-save').click();

    // Dialog should still be visible (browser validation prevents submission)
    await expect(dialog).toBeVisible();

    // Fill in required fields
    await dialog.getByLabel(t.common.labels.name).fill(entityName);

    // Now submit should work
    await dialog.getByTestId('entity-dialog-save').click();
    await expect(dialog).not.toBeVisible();
  });
});
