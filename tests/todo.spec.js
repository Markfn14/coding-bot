const path = require('path');
const fs = require('fs');
const { test, expect } = require('@playwright/test');

// Run artifacts live in test-results/, which is git-ignored.
const artifacts = path.join(__dirname, '..', 'test-results');
const screenshots = path.join(artifacts, 'screens');
const pageErrorsLog = path.join(artifacts, 'page-errors.log');
fs.mkdirSync(screenshots, { recursive: true });

test.beforeEach(async ({ page }) => {
  fs.writeFileSync(pageErrorsLog, '');
  page.on('pageerror', (error) => {
    fs.appendFileSync(pageErrorsLog, error.message + '\n');
  });
});

test('add, check off, uncheck and delete items in the real page', async ({ page }) => {
  await page.goto('/index.html');

  const newItem = page.getByLabel('New to-do item');
  const items = page.getByRole('listitem');

  // Add with Enter.
  await newItem.fill('Buy milk');
  await newItem.press('Enter');
  await expect(items).toHaveCount(1);
  await expect(newItem).toHaveValue('');

  // Add with the "Add" button.
  await newItem.fill('Walk the dog');
  await page.getByRole('button', { name: 'Add' }).click();
  await expect(items).toHaveCount(2);
  await expect(newItem).toHaveValue('');
  await page.screenshot({ path: path.join(screenshots, '1-added.png') });

  // Clicking an unfinished item checks it off.
  const milkCheckbox = page.getByRole('checkbox', { name: 'Buy milk' });
  await expect(milkCheckbox).not.toBeChecked();
  await page.getByText('Buy milk').click();
  await expect(milkCheckbox).toBeChecked();
  await expect(page.getByText('Buy milk')).toHaveCSS('text-decoration-line', 'line-through');
  await page.screenshot({ path: path.join(screenshots, '2-checked.png') });

  // The other item is untouched.
  await expect(page.getByRole('checkbox', { name: 'Walk the dog' })).not.toBeChecked();

  // Clicking it again unchecks it.
  await page.getByText('Buy milk').click();
  await expect(milkCheckbox).not.toBeChecked();
  await expect(page.getByText('Buy milk')).not.toHaveCSS('text-decoration-line', 'line-through');

  // Check a second item, then delete it; the other item keeps its state.
  await page.getByText('Walk the dog').click();
  await expect(page.getByRole('checkbox', { name: 'Walk the dog' })).toBeChecked();
  await page.getByText('Buy milk').click();
  await expect(milkCheckbox).toBeChecked();

  await page.getByRole('button', { name: 'Delete Buy milk' }).click();
  await expect(items).toHaveCount(1);
  await expect(page.getByText('Buy milk')).toHaveCount(0);
  await expect(page.getByText('Walk the dog')).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Walk the dog' })).toBeChecked();
  await page.screenshot({ path: path.join(screenshots, '3-deleted.png') });

  await expect(page.locator('body')).not.toContainText('undefined');
  expect(fs.readFileSync(pageErrorsLog, 'utf8')).toBe('');
});

test('an empty title adds nothing and keeps focus in the input', async ({ page }) => {
  await page.goto('/index.html');

  const newItem = page.getByLabel('New to-do item');
  await newItem.fill('   ');
  await newItem.press('Enter');
  await page.getByRole('button', { name: 'Add' }).click();

  await expect(page.getByRole('listitem')).toHaveCount(0);
  await expect(newItem).toBeFocused();
  await page.screenshot({ path: path.join(screenshots, '4-empty-input.png') });
  expect(fs.readFileSync(pageErrorsLog, 'utf8')).toBe('');
});
