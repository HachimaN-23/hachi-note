import { test, expect } from '@playwright/test';

test.describe('Notes App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('creates a note', async ({ page }) => {
    const id = Date.now();
    const title = `Note ${id}`;
    await page.getByRole('button', { name: /New/ }).click();
    await page.getByPlaceholder('Note title...').fill(title);
    await page.getByPlaceholder('Write something...').fill(`Body ${id}`);
    await page.getByRole('button', { name: 'Add note' }).click();

    await expect(page.getByTestId('note-card').filter({ hasText: title }).first()).toBeVisible();
  });

  test('searches notes', async ({ page }) => {
    const id = Date.now();
    const title = `SearchMe ${id}`;
    await page.getByRole('button', { name: /New/ }).click();
    await page.getByPlaceholder('Note title...').fill(title);
    await page.getByPlaceholder('Write something...').fill('content');
    await page.getByRole('button', { name: 'Add note' }).click();

    await page.getByPlaceholder('Search notes...').fill(title);
    await expect(page.getByTestId('note-card').filter({ hasText: title }).first()).toBeVisible();
  });

  test('pins and unpins a note', async ({ page }) => {
    const id = Date.now();
    const title = `PinMe ${id}`;
    await page.getByRole('button', { name: /New/ }).click();
    await page.getByPlaceholder('Note title...').fill(title);
    await page.getByRole('button', { name: 'Add note' }).click();

    const card = page.getByTestId('note-card').filter({ hasText: title }).first();
    await card.locator('button[title="Pin to top"]').click();
    await expect(card.locator('button[title="Unpin"]')).toBeVisible();

    await card.locator('button[title="Unpin"]').click();
    await expect(card.locator('button[title="Pin to top"]')).toBeVisible();
  });

  test('renders markdown', async ({ page }) => {
    const id = Date.now();
    const title = `Md ${id}`;
    await page.getByRole('button', { name: /New/ }).click();
    await page.getByPlaceholder('Note title...').fill(title);
    await page.getByPlaceholder('Write something...').fill('**hello** `world`');
    await page.getByRole('button', { name: 'Add note' }).click();

    const card = page.getByTestId('note-card').filter({ hasText: title }).first();
    await expect(card.locator('strong').filter({ hasText: 'hello' })).toBeVisible();
    await expect(card.locator('code').filter({ hasText: 'world' })).toBeVisible();
  });
});
