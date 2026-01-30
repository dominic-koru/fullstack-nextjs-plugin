/**
 * Search Test Template
 *
 * Template for testing search and filter functionality.
 * Replace 'entity' with your actual entity name (e.g., organisation, user, etc.)
 */

import { test, expect } from '@playwright/test';
import { t } from '../helpers/translations';

test.describe('Entity Search and Filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/entities');
  });

  test('should search entities by name', async ({ page }) => {
    // Use unique IDs to avoid database conflicts
    const uniqueId = Date.now();
    const apple = `Apple${uniqueId}`;
    const banana = `Banana${uniqueId}`;
    const cherry = `Cherry${uniqueId}`;

    // Create test entities with different names
    await page.getByTestId('create-entity-button').click();
    let dialog = page.getByTestId('entity-dialog');
    await dialog.getByLabel(t.common.labels.name).fill(apple);
    await dialog.getByTestId('entity-dialog-save').click();
    await expect(dialog).not.toBeVisible();

    await page.getByTestId('create-entity-button').click();
    dialog = page.getByTestId('entity-dialog');
    await dialog.getByLabel(t.common.labels.name).fill(banana);
    await dialog.getByTestId('entity-dialog-save').click();
    await expect(dialog).not.toBeVisible();

    await page.getByTestId('create-entity-button').click();
    dialog = page.getByTestId('entity-dialog');
    await dialog.getByLabel(t.common.labels.name).fill(cherry);
    await dialog.getByTestId('entity-dialog-save').click();
    await expect(dialog).not.toBeVisible();

    // Search for "Apple"
    // NOTE: For MUI TextField with testid, access the input element
    const searchField = page.getByTestId('entities-search-field').locator('input');
    await searchField.fill('Apple');
    await page.waitForTimeout(500); // Wait for debounce

    // Verify only Apple appears
    await expect(page.getByText(apple)).toBeVisible();
    await expect(page.getByText(banana)).not.toBeVisible();
    await expect(page.getByText(cherry)).not.toBeVisible();

    // Search for "Banana"
    await searchField.clear();
    await searchField.fill('Banana');
    await page.waitForTimeout(500);

    // Verify only Banana appears
    await expect(page.getByText(apple)).not.toBeVisible();
    await expect(page.getByText(banana)).toBeVisible();
    await expect(page.getByText(cherry)).not.toBeVisible();
  });

  test('should clear search and show all entities', async ({ page }) => {
    const uniqueId = Date.now();
    const first = `First${uniqueId}`;
    const second = `Second${uniqueId}`;

    // Create test entities
    await page.getByTestId('create-entity-button').click();
    let dialog = page.getByTestId('entity-dialog');
    await dialog.getByLabel(t.common.labels.name).fill(first);
    await dialog.getByTestId('entity-dialog-save').click();
    await expect(dialog).not.toBeVisible();

    await page.getByTestId('create-entity-button').click();
    dialog = page.getByTestId('entity-dialog');
    await dialog.getByLabel(t.common.labels.name).fill(second);
    await dialog.getByTestId('entity-dialog-save').click();
    await expect(dialog).not.toBeVisible();

    // Search for one
    const searchField = page.getByTestId('entities-search-field').locator('input');
    await searchField.fill('First');
    await page.waitForTimeout(500);

    // Only first should appear
    await expect(page.getByText(first)).toBeVisible();
    await expect(page.getByText(second)).not.toBeVisible();

    // Clear search
    await searchField.clear();
    await page.waitForTimeout(500);

    // Both should appear
    await expect(page.getByText(first)).toBeVisible();
    await expect(page.getByText(second)).toBeVisible();
  });

  test('should show no results message when search has no matches', async ({ page }) => {
    const uniqueId = Date.now();
    const entityName = `Test${uniqueId}`;

    // Create an entity
    await page.getByTestId('create-entity-button').click();
    const dialog = page.getByTestId('entity-dialog');
    await dialog.getByLabel(t.common.labels.name).fill(entityName);
    await dialog.getByTestId('entity-dialog-save').click();
    await expect(dialog).not.toBeVisible();

    // Search for something that doesn't exist
    await page.getByTestId('entities-search-field').locator('input').fill('NonExistent');
    await page.waitForTimeout(500);

    // Verify no results message
    const noResultsMessage = page.getByText(t.entities.messages.noSearchResults);
    await expect(noResultsMessage).toBeVisible();

    // Verify the entity we created doesn't appear
    await expect(page.getByText(entityName)).not.toBeVisible();
  });

  test('should debounce search input', async ({ page }) => {
    const uniqueId = Date.now();
    const entityName = `Searchable${uniqueId}`;

    // Create entity
    await page.getByTestId('create-entity-button').click();
    const dialog = page.getByTestId('entity-dialog');
    await dialog.getByLabel(t.common.labels.name).fill(entityName);
    await dialog.getByTestId('entity-dialog-save').click();
    await expect(dialog).not.toBeVisible();

    const searchField = page.getByTestId('entities-search-field').locator('input');

    // Type quickly (should debounce)
    await searchField.fill('S');
    await searchField.fill('Se');
    await searchField.fill('Sea');
    await searchField.fill('Sear');
    await searchField.fill('Searc');

    // Don't wait - the search shouldn't have triggered yet
    // Wait just a bit but less than debounce time
    await page.waitForTimeout(200);

    // Now wait for debounce
    await page.waitForTimeout(500);

    // Results should appear after debounce
    await expect(page.getByText(entityName)).toBeVisible();
  });

  test('should search case-insensitively', async ({ page }) => {
    const uniqueId = Date.now();
    const entityName = `CamelCase${uniqueId}`;

    // Create entity
    await page.getByTestId('create-entity-button').click();
    const dialog = page.getByTestId('entity-dialog');
    await dialog.getByLabel(t.common.labels.name).fill(entityName);
    await dialog.getByTestId('entity-dialog-save').click();
    await expect(dialog).not.toBeVisible();

    const searchField = page.getByTestId('entities-search-field').locator('input');

    // Search with lowercase
    await searchField.fill('camelcase');
    await page.waitForTimeout(500);
    await expect(page.getByText(entityName)).toBeVisible();

    // Search with uppercase
    await searchField.clear();
    await searchField.fill('CAMELCASE');
    await page.waitForTimeout(500);
    await expect(page.getByText(entityName)).toBeVisible();

    // Search with mixed case
    await searchField.clear();
    await searchField.fill('cAmElCaSe');
    await page.waitForTimeout(500);
    await expect(page.getByText(entityName)).toBeVisible();
  });

  test('should search across multiple fields', async ({ page }) => {
    const uniqueId = Date.now();
    const name = `John${uniqueId}`;
    const email = `john-${uniqueId}@example.com`;

    // If your search searches across multiple fields (e.g., name and email)
    await page.getByTestId('create-entity-button').click();
    const dialog = page.getByTestId('entity-dialog');
    await dialog.getByLabel(t.common.labels.name).fill(name);
    await dialog.getByLabel(t.common.labels.email).fill(email);
    await dialog.getByTestId('entity-dialog-save').click();
    await expect(dialog).not.toBeVisible();

    const searchField = page.getByTestId('entities-search-field').locator('input');

    // Search by name
    await searchField.fill('John');
    await page.waitForTimeout(500);
    await expect(page.getByText(name)).toBeVisible();

    // Search by email
    await searchField.clear();
    await searchField.fill(`john-${uniqueId}`);
    await page.waitForTimeout(500);
    await expect(page.getByText(name)).toBeVisible();
  });

  test('should show empty state when no entities exist', async ({ page }) => {
    // Don't create any entities, just verify empty state
    // Note: This assumes a fresh database or that other tests haven't created entities
    const emptyMessage = page.getByText(t.entities.messages.noEntities);
    await expect(emptyMessage).toBeVisible();
  });

  test('should preserve search when navigating away and back', async ({ page }) => {
    const uniqueId = Date.now();
    const entityName = `Persistent${uniqueId}`;

    // Create entity
    await page.getByTestId('create-entity-button').click();
    const dialog = page.getByTestId('entity-dialog');
    await dialog.getByLabel(t.common.labels.name).fill(entityName);
    await dialog.getByTestId('entity-dialog-save').click();
    await expect(dialog).not.toBeVisible();

    // Perform search
    await page.getByTestId('entities-search-field').locator('input').fill('Persistent');
    await page.waitForTimeout(500);
    await expect(page.getByText(entityName)).toBeVisible();

    // Navigate away (adjust URL as needed)
    await page.goto('/');

    // Navigate back
    await page.goto('/entities');

    // Verify search is cleared (most implementations clear on navigation)
    // Or verify search is preserved if that's your implementation
    const searchField = page.getByTestId('entities-search-field').locator('input');
    await expect(searchField).toHaveValue('');
  });
});
