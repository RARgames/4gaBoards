const path = require('path');

const { expect, test } = require('@playwright/test');

const {
  cleanupProject,
  createBoard,
  createBoardMembership,
  createLabel,
  createList,
  createProject,
  createUser,
  deleteUser,
  login,
  setAuthCookies,
  uniqueName,
  uniqueUserData,
} = require('./helpers/boardsApi');
const { BoardPage } = require('./pages/BoardPage');
const { CardModalPage } = require('./pages/CardModalPage');

test.describe('card modal workflows', () => {
  test('adds member, label, due date, timer, description, task, attachment, and comment', async ({ page, request }, testInfo) => {
    const boardPage = new BoardPage(page);
    const cardModal = new CardModalPage(page);
    const accessToken = await login(request);
    const project = await createProject(request, accessToken, uniqueName('E2E Card Modal Project', testInfo));
    const board = await createBoard(request, accessToken, project.id, uniqueName('E2E Card Modal Board', testInfo));
    const list = await createList(request, accessToken, board.id, uniqueName('Card Details', testInfo));
    const targetList = await createList(request, accessToken, board.id, uniqueName('Card Done', testInfo), 1);
    const userData = uniqueUserData(testInfo);
    const user = await createUser(request, accessToken, userData);
    const cardName = uniqueName('Card modal coverage', testInfo);
    const renamedCardName = uniqueName('Renamed card modal coverage', testInfo);
    const labelName = uniqueName('Regression label', testInfo);
    const description = `Card modal description ${Date.now()}`;
    const taskName = uniqueName('Verify modal controls', testInfo);
    const comment = `Card modal comment ${Date.now()}`;
    const deleteCardName = uniqueName('Delete through menu', testInfo);
    const attachmentPath = path.join(__dirname, 'fixtures', 'card-attachment.txt');

    await createBoardMembership(request, accessToken, board.id, user.id, 'editor');
    await createLabel(request, accessToken, board.id, labelName);
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await setAuthCookies(page, accessToken);

    try {
      await boardPage.gotoBoard(board.id);
      await boardPage.ensureBoardView();
      await expect(boardPage.list(list.name)).toBeVisible();
      await expect(boardPage.list(targetList.name)).toBeVisible();

      await boardPage.createCard(cardName);
      await boardPage.openCard(cardName);
      await expect(cardModal.closeButton()).toBeVisible();

      await cardModal.editCardButton().click();
      await expect(cardModal.action('Edit Name')).toBeVisible();
      await expect(cardModal.action('Edit Members')).toBeVisible();
      await expect(cardModal.action('Edit Labels')).toBeVisible();
      await expect(cardModal.action('Edit Due Date')).toBeVisible();
      await expect(cardModal.action('Edit Timer')).toBeVisible();
      await expect(cardModal.action('Move Card')).toBeVisible();
      await expect(cardModal.action('Duplicate Card')).toBeVisible();
      await expect(cardModal.action('Copy Link')).toBeVisible();
      await expect(cardModal.action('Check Activity')).toBeVisible();
      await expect(cardModal.action('Delete Card')).toBeVisible();
      await page.keyboard.press('Escape');

      await cardModal.renameFromAction(renamedCardName);
      await expect(cardModal.cardTitle(renamedCardName)).toBeVisible();

      await cardModal.assignMemberFromAction(userData.name);
      await expect(cardModal.memberAvatar(userData.name)).toBeVisible();

      await cardModal.applyLabelFromAction(labelName);
      await expect(cardModal.label(labelName)).toBeVisible();

      await cardModal.saveDefaultDueDateFromAction();
      await expect(cardModal.editDueDateButton()).toBeVisible();

      await cardModal.setTimerSecondsFromAction(3);
      await expect(cardModal.timerValue('00:03')).toBeVisible();

      await cardModal.moveToListFromAction(list.name, targetList.name);
      await expect(cardModal.cardTitle(renamedCardName)).toBeVisible();
      await expect(page.getByTitle(targetList.name).last()).toBeVisible();

      await cardModal.duplicateFromAction();
      await expect(page.getByRole('button').filter({ hasText: renamedCardName })).toHaveCount(2);

      await cardModal.copyLinkFromAction();
      await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain('/cards/');

      await cardModal.openActivityFromAction(renamedCardName);
      await expect(cardModal.activityTitle(renamedCardName)).toBeVisible();
      await cardModal.backButton().click();
      await page.keyboard.press('Escape');

      await cardModal.addDescription(description);
      await expect(cardModal.descriptionText(description)).toBeVisible();

      await cardModal.addTask(taskName);
      await expect(cardModal.task(taskName)).toBeVisible();

      await cardModal.uploadAttachment(attachmentPath);
      await expect(cardModal.attachment('card-attachment.txt')).toBeVisible();

      await cardModal.addComment(comment);
      await expect(cardModal.comment(comment)).toBeVisible();

      await cardModal.closeButton().click();
      await expect(cardModal.closeButton()).toBeHidden();

      await boardPage.createCard(deleteCardName);
      await boardPage.openCard(deleteCardName);
      await cardModal.deleteFromAction();
      await expect(cardModal.closeButton()).toBeHidden();
      await expect(boardPage.card(deleteCardName)).toBeHidden();
    } finally {
      await cleanupProject(request, accessToken, project.id);
      await deleteUser(request, accessToken, user.id);
    }
  });
});
