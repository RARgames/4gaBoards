import { test, expect } from '../../fixtures';
import { CardModalPage } from '../../pages/CardModalPage';

test.describe('Card Modal - Description', () => {
  test('should add a description to a card', async ({ page, testCard, runId }) => {
    const cardModal = new CardModalPage(page);
    const descriptionText = `Description ${runId}`;

    await cardModal.goto(testCard.id);

    // Click the "Add Description" body button (the larger one in the section)
    const descSection = cardModal.section('Description');
    await descSection.locator('button:has-text("Add Description")').click();

    // Markdown editor should appear
    const editor = descSection.locator('textarea.w-md-editor-text-input');
    await expect(editor).toBeVisible();
    await editor.fill(descriptionText);

    // Save the description
    await descSection.locator('button[title="Save"]').click();

    // Verify the description text is displayed
    await expect(descSection.getByText(descriptionText)).toBeVisible();
  });
});
