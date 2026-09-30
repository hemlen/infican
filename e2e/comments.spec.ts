import { test, expect } from '@playwright/test';

test.describe('Infican Commenting & Canvas E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Clear localStorage to ensure a predictable baseline with default demo threads
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('canvas');
  });

  test('E2E 1: Comment panel toggle, collapse, and filter tabs navigation', async ({ page }) => {
    // 1. Verify Comment Panel is initially open
    const panelHeader = page.getByRole('heading', { name: 'Comments' });
    await expect(panelHeader).toBeVisible();

    // 2. Collapse the panel
    const collapseBtn = page.getByRole('button', { name: 'Collapse Panel' });
    await collapseBtn.click();
    await expect(panelHeader).not.toBeVisible();

    // 3. Verify floating trigger button appears and re-open the panel
    const triggerBtn = page.getByRole('button', { name: /Comments/i });
    await expect(triggerBtn).toBeVisible();
    await triggerBtn.click();
    await expect(panelHeader).toBeVisible();

    // 4. Switch between Open and Resolved tabs
    const openTab = page.getByRole('button', { name: /^Open/ });
    const resolvedTab = page.getByRole('button', { name: /^Resolved/ });

    await expect(openTab).toBeVisible();
    await expect(resolvedTab).toBeVisible();

    // Initially on Open tab; verify open threads are rendered
    await expect(page.getByText('Elena Rostova').first()).toBeVisible();

    // Switch to Resolved tab
    await resolvedTab.click();
    await expect(page.getByText('Origin crosshair at (0, 0)')).toBeVisible();

    // Switch back to Open tab
    await openTab.click();
    await expect(page.getByText('The 3D STL mesh normals and lighting look crisp')).toBeVisible();
  });

  test('E2E 2: Interactive comment pin placement on canvas and draft submission', async ({ page }) => {
    // 1. Click Add button in the Comment Panel header to initiate placement mode
    const addCommentBtn = page.getByTitle('Add comment to canvas');
    await addCommentBtn.click();

    // 2. Verify placement banner is displayed
    const banner = page.getByText('Click anywhere on the canvas to place comment');
    await expect(banner).toBeVisible();

    // 3. Click on the canvas at (300, 300) to drop the pin
    const canvas = page.locator('canvas');
    await canvas.click({ position: { x: 300, y: 300 } });

    // 4. Verify draft card is rendered with textarea
    const draftTextarea = page.getByPlaceholder('Leave a comment on the canvas...');
    await expect(draftTextarea).toBeVisible();

    // 5. Fill and submit the new comment
    const uniqueCommentText = `E2E automated comment pin test - ${Date.now()}`;
    await draftTextarea.fill(uniqueCommentText);

    const postBtn = page.getByRole('button', { name: 'Post' });
    await postBtn.click();

    // 6. Verify the new comment appears in the sidebar thread list
    await expect(page.getByText(uniqueCommentText)).toBeVisible();
  });

  test('E2E 3: Thread reply and resolution lifecycle', async ({ page }) => {
    // 1. Locate the first thread card and open its reply form
    const firstThreadCard = page.locator('div[id^="thread-card-"]').first();
    await expect(firstThreadCard).toBeVisible();

    const replyToggleBtn = firstThreadCard.getByRole('button', { name: 'Reply', exact: true });
    await replyToggleBtn.click();

    // 2. Type and submit a reply
    const replyInput = firstThreadCard.getByPlaceholder('Write a reply...');
    await expect(replyInput).toBeVisible();

    const replyContent = 'Playwright automated reply verification!';
    await replyInput.fill(replyContent);

    const submitReplyBtn = firstThreadCard.getByRole('button', { name: 'Reply', exact: true });
    await submitReplyBtn.click();

    // 3. Expand collapsed replies if hidden, then verify reply appears inside the thread
    const showMoreBtn = firstThreadCard.getByRole('button', { name: /Show \d+ more repl/i });
    if (await showMoreBtn.isVisible()) {
      await showMoreBtn.click();
    }
    await expect(firstThreadCard.getByText(replyContent)).toBeVisible();

    // 4. Resolve the thread using the Resolve button in the card toolbar
    const resolveBtn = firstThreadCard.getByTitle('Mark as Resolved');
    await resolveBtn.click();

    // 5. Navigate to Resolved tab and verify thread has moved there with Resolved status
    const resolvedTab = page.getByRole('button', { name: /^Resolved/ });
    await resolvedTab.click();

    const resolvedCard = page.locator('div[id^="thread-card-"]').first();
    await expect(resolvedCard).toBeVisible();
    await expect(resolvedCard.getByText('Resolved')).toBeVisible();
  });
});

