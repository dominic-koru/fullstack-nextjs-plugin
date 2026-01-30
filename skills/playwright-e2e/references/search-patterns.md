# Search and Filter Patterns

Patterns for testing search functionality with debouncing, filtering, and empty states.

## Basic Search Pattern

```typescript
test('search entities', async ({ page }) => {
  await page.goto('/entities');

  // Create test data
  await createEntity(page, 'Apple Corporation');
  await createEntity(page, 'Banana Industries');

  // Search
  const searchField = page.getByTestId('entities-search-field');
  await searchField.fill('Apple');
  await page.waitForTimeout(500); // Wait for debounce

  // Verify results
  await expect(page.getByText('Apple Corporation')).toBeVisible();
  await expect(page.getByText('Banana Industries')).not.toBeVisible();
});
```

## Debounce Pattern

```typescript
test('search with debounce', async ({ page }) => {
  await page.goto('/entities');
  await createEntity(page, 'Searchable Entity');

  const searchField = page.getByTestId('entities-search-field');

  // Type quickly (should debounce)
  await searchField.fill('S');
  await searchField.fill('Se');
  await searchField.fill('Sea');

  // Wait less than debounce time
  await page.waitForTimeout(200);

  // Results shouldn't appear yet

  // Wait for debounce to complete
  await page.waitForTimeout(400); // Total 600ms

  // Results should now appear
  await expect(page.getByText('Searchable Entity')).toBeVisible();
});
```

## Clear Search Pattern

```typescript
test('clear search', async ({ page }) => {
  await page.goto('/entities');

  await createEntity(page, 'First');
  await createEntity(page, 'Second');

  const searchField = page.getByTestId('entities-search-field');

  // Search for one
  await searchField.fill('First');
  await page.waitForTimeout(500);
  await expect(page.getByText('First')).toBeVisible();
  await expect(page.getByText('Second')).not.toBeVisible();

  // Clear search
  await searchField.clear();
  await page.waitForTimeout(500);

  // Both should appear
  await expect(page.getByText('First')).toBeVisible();
  await expect(page.getByText('Second')).toBeVisible();
});
```

## No Results Pattern

```typescript
test('show no results message', async ({ page }) => {
  await page.goto('/entities');
  await createEntity(page, 'Test Entity');

  // Search for non-existent
  await page.getByTestId('entities-search-field').fill('NonExistent');
  await page.waitForTimeout(500);

  // Verify no results message
  await expect(page.getByText(t.entities.messages.noSearchResults)).toBeVisible();
  await expect(page.getByText('Test Entity')).not.toBeVisible();
});
```

## Case-Insensitive Search Pattern

```typescript
test('search case-insensitively', async ({ page }) => {
  await page.goto('/entities');
  await createEntity(page, 'CamelCase Entity');

  const searchField = page.getByTestId('entities-search-field');

  // Lowercase
  await searchField.fill('camelcase');
  await page.waitForTimeout(500);
  await expect(page.getByText('CamelCase Entity')).toBeVisible();

  // Uppercase
  await searchField.clear();
  await searchField.fill('CAMELCASE');
  await page.waitForTimeout(500);
  await expect(page.getByText('CamelCase Entity')).toBeVisible();
});
```

## Multi-Field Search Pattern

```typescript
test('search across multiple fields', async ({ page }) => {
  await page.goto('/entities');

  // Create entity with multiple searchable fields
  await page.getByTestId('create-entity-button').click();
  const dialog = page.getByTestId('entity-dialog');
  await dialog.getByTestId('entity-name-field').fill('John Doe');
  await dialog.getByTestId('entity-email-field').fill('john@example.com');
  await dialog.getByTestId('entity-dialog-save').click();
  await expect(dialog).not.toBeVisible();

  const searchField = page.getByTestId('entities-search-field');

  // Search by name
  await searchField.fill('John');
  await page.waitForTimeout(500);
  await expect(page.getByText('John Doe')).toBeVisible();

  // Search by email
  await searchField.clear();
  await searchField.fill('john@example');
  await page.waitForTimeout(500);
  await expect(page.getByText('John Doe')).toBeVisible();
});
```

## Best Practices

### 1. Always Wait for Debounce

```typescript
// ✅ Good
await searchField.fill('query');
await page.waitForTimeout(500); // Adjust based on your debounce time
await expect(results).toBeVisible();

// ❌ Bad
await searchField.fill('query');
await expect(results).toBeVisible(); // May fail due to race condition
```

### 2. Clear Search Between Tests

```typescript
test.afterEach(async ({ page }) => {
  // Clear search field
  const searchField = page.getByTestId('entities-search-field');
  if (await searchField.isVisible()) {
    await searchField.clear();
  }
});
```

### 3. Test Empty States

```typescript
test('empty state when no results', async ({ page }) => {
  await page.goto('/entities');

  // Don't create any entities
  // Or search for something that doesn't exist

  await expect(page.getByText(t.entities.messages.noEntities)).toBeVisible();
});
```
