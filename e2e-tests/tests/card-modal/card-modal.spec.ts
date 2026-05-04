import { test, expect } from '../../fixtures';
import { CardModalPage } from '../../pages/CardModalPage';

test.describe('Card Modal - View', () => {
  test('should display card modal with all sections', async ({ page, testCard, testList }) => {
    const cardModal = new CardModalPage(page);

    await cardModal.goto(testCard.id);

    // Verify card title and list name
    await cardModal.expectTitle(testCard.name);
    await cardModal.expectListName(testList.name);

    // Verify all property sections are present
    await cardModal.expectActionButtonVisible('Add Member');
    await cardModal.expectActionButtonVisible('Add Label');
    await cardModal.expectActionButtonVisible('Add Due Date');
    await cardModal.expectActionButtonVisible('Edit Timer');

    // Verify all module sections (each has icon + body button, use .first())
    await expect(cardModal.actionButton('Add Description').first()).toBeVisible();
    await expect(cardModal.actionButton('Add Task').first()).toBeVisible();
    await expect(cardModal.actionButton('Add Attachment').first()).toBeVisible();
    await expect(cardModal.actionButton('Add comment').first()).toBeVisible();

    // Verify header actions
    await cardModal.expectActionButtonVisible('Subscribe');
    await cardModal.expectActionButtonVisible('Delete Card');
    await cardModal.expectActionButtonVisible('Close Card');
  });

  test('should close card modal', async ({ page, testCard }) => {
    const cardModal = new CardModalPage(page);

    await cardModal.goto(testCard.id);
    await cardModal.expectVisible();

    await cardModal.close();
    await cardModal.expectClosed();
  });
});

test.describe('Card Modal - Add Member', () => {
  test('should add a member to the card', async ({ page, api, testCard, testProject, testUser }) => {
    // Seed: add testUser as a project manager so they appear in the member popup
    await api.createProjectManager(testProject.id, testUser.id);

    const cardModal = new CardModalPage(page);
    await cardModal.goto(testCard.id);

    // Click Add Member to open popup
    await cardModal.clickAddMember();

    // Verify the popup opened with Members header
    const popup = page.locator('[class*="Popup_popup"]');
    await expect(popup).toBeVisible();
    await expect(popup.locator('[class*="PopupHeader_content"]')).toHaveText('Members');

    // Click the seeded user's button to add them as a card member
    const memberButton = popup.locator('[class*="MembershipsStep_menu"] button', {
      hasText: testUser.name,
    });
    await memberButton.click();

    // Close popup
    await popup.locator('button[title="Close"]').click();

    // Verify the Members property now shows in the card modal
    await cardModal.expectPropertyVisible('Members');
  });
});

test.describe('Card Modal - Add Label', () => {
  test('should add a label to the card', async ({ page, api, testCard, testBoard, runId }) => {
    // Create a label on the board via API
    const labelName = `Label ${runId}`;
    await api.createLabel(testBoard.id, labelName, 'berry-red');

    const cardModal = new CardModalPage(page);
    await cardModal.goto(testCard.id);

    // Click Add Label to open popup
    await cardModal.clickAddLabel();

    // Verify the popup opened
    const popup = page.locator('[class*="Popup_popup"]');
    await expect(popup).toBeVisible();
    await expect(popup.locator('[class*="PopupHeader_content"]')).toHaveText('Labels');

    // Click the label to add it to the card
    const labelItem = popup.locator(`[class*="Item_name"][title="${labelName}"]`);
    await expect(labelItem).toBeVisible();
    await labelItem.click();

    // Close popup
    await popup.locator('button[title="Close"]').click();

    // Verify the label now appears in the card properties
    await cardModal.expectPropertyVisible('Labels');
  });
});

test.describe('Card Modal - Due Date', () => {
  test('should set a due date on the card', async ({ page, testCard }) => {
    const cardModal = new CardModalPage(page);
    await cardModal.goto(testCard.id);

    // Click Add Due Date to open popup
    await cardModal.clickAddDueDate();

    // Verify the popup opened
    const popup = page.locator('[class*="Popup_popup"]');
    await expect(popup).toBeVisible();
    await expect(popup.locator('[class*="PopupHeader_content"]')).toHaveText('Due Date');

    // The date input should be pre-filled with today's date
    const dateInput = popup.locator('input[name="date"]');
    await expect(dateInput).toBeVisible();

    // Clear and enter a specific date
    await dateInput.clear();
    await dateInput.fill('15.12.2026');

    // Click Save
    await popup.locator('button[title="Save"]').click();

    // Verify the Due Date property now shows in the card
    await cardModal.expectPropertyVisible('Due Date');
  });
});

test.describe('Card Modal - Add Task', () => {
  test('should add a task to the card', async ({ page, testCard, runId }) => {
    const cardModal = new CardModalPage(page);
    const taskName = `Task ${runId}`;

    await cardModal.goto(testCard.id);

    // Click Add Task in the Tasks section header
    await cardModal.clickAddTask();

    // The task input is a textarea with placeholder "Enter task description..."
    const tasksSection = cardModal.section('Tasks');
    const taskInput = tasksSection.getByPlaceholder('Enter task description...');
    await expect(taskInput).toBeVisible();
    await taskInput.fill(taskName);
    await taskInput.press('Enter');

    // Verify the task appears in the section
    await expect(tasksSection.getByText(taskName)).toBeVisible();
  });
});

test.describe('Card Modal - Add Comment', () => {
  test('should add a comment to the card', async ({ page, testCard, runId }) => {
    const cardModal = new CardModalPage(page);
    const commentText = `Test comment ${runId}`;

    await cardModal.goto(testCard.id);

    // Click Add Comment
    await cardModal.clickAddComment();

    // The comment editor is a markdown textarea
    const commentsSection = cardModal.section('Comments');
    const editor = commentsSection.locator('textarea.w-md-editor-text-input');
    await expect(editor).toBeVisible();
    await editor.fill(commentText);

    // Submit the comment
    await commentsSection.locator('button[title="Save"]').click();

    // Verify the comment text appears in the section
    await expect(commentsSection.getByText(commentText)).toBeVisible();
  });
});
