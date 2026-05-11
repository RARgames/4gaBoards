class CardModalPage {
  constructor(page) {
    this.page = page;
  }

  closeButton() {
    return this.page.getByRole('button', { name: 'Close Card' });
  }

  editCardButton() {
    return this.page.getByRole('button', { name: 'Edit Card' }).last();
  }

  popup() {
    return this.page.locator('[role="dialog"][data-prevent-card-switch="true"]').last();
  }

  action(actionName) {
    return this.popup().getByRole('button', { name: actionName, exact: true }).last();
  }

  backButton() {
    return this.popup().getByRole('button', { name: 'Back' }).last();
  }

  cardNameField() {
    return this.page.getByRole('textbox', { name: 'Enter card name...' }).last();
  }

  cardTitle(cardName) {
    return this.page.getByTitle(cardName).last();
  }

  addMemberButton() {
    return this.page.getByRole('button', { name: 'Add Member' }).last();
  }

  memberSearchField() {
    return this.page.getByPlaceholder('Search members...');
  }

  memberOption(userName) {
    return this.page.getByRole('button', { name: new RegExp(userName) }).last();
  }

  memberAvatar(userName) {
    return this.page.getByTitle(userName).first();
  }

  addLabelButton() {
    return this.page.getByRole('button', { name: 'Add Label' }).last();
  }

  labelSearchField() {
    return this.page.getByPlaceholder('Search labels or create one...');
  }

  createNewLabelButton() {
    return this.page.getByRole('button', { name: 'Create New Label' });
  }

  labelNameField() {
    return this.page.getByPlaceholder('Enter label name...');
  }

  createLabelButton() {
    return this.page.getByRole('button', { name: 'Create Label' });
  }

  label(labelName) {
    return this.page.locator(`[title="${labelName}"]`).last();
  }

  labelOption(labelName) {
    return this.popup().getByTitle(labelName, { exact: true }).first();
  }

  addDueDateButton() {
    return this.page.getByRole('button', { name: 'Add Due Date' }).last();
  }

  editDueDateButton() {
    return this.page.getByRole('button', { name: 'Edit Due Date' }).last();
  }

  dueDateField() {
    return this.page.getByPlaceholder('Enter due date...');
  }

  editTimerButton() {
    return this.page.getByRole('button', { name: 'Edit Timer' }).last();
  }

  startTimerButton() {
    return this.page.getByRole('button', { name: 'Start Timer' }).last();
  }

  runningTimerButton() {
    return this.page.getByRole('button', { name: 'Stop Timer' });
  }

  timerSecondsField() {
    return this.page.locator('input[name="seconds"]').last();
  }

  timerValue(value) {
    return this.page.getByRole('button', { name: value, exact: true }).last();
  }

  addDescriptionButton() {
    return this.page.getByRole('button').filter({ hasText: 'Add description' });
  }

  descriptionField() {
    return this.page.getByPlaceholder('Enter description...');
  }

  descriptionText(description) {
    return this.page.getByText(description);
  }

  saveButton() {
    return this.page.getByRole('button', { name: 'Save' }).last();
  }

  moveListDropdown(currentListName) {
    return this.page.locator(`input[title="${currentListName}"]`).last();
  }

  moveListOption(listName) {
    return this.page.locator(`[name="${listName}"]`).last();
  }

  moveButton() {
    return this.page.getByRole('button', { name: 'Move' }).last();
  }

  activityTitle(cardName) {
    return this.page.getByText(`Activity for ${cardName}`);
  }

  deleteConfirmButton() {
    return this.popup().getByRole('button', { name: /^Delete card$/i }).last();
  }

  addTaskButton() {
    return this.page.getByRole('button', { name: 'Add Task' }).last();
  }

  taskField() {
    return this.page.getByPlaceholder('Enter task description...');
  }

  task(taskName) {
    return this.page.getByText(taskName, { exact: true });
  }

  fileInput() {
    return this.page.locator('input[type="file"]').last();
  }

  attachment(attachmentName) {
    return this.page.getByText(attachmentName, { exact: true });
  }

  addCommentButton() {
    return this.page.getByRole('button', { name: 'Add Comment' }).last();
  }

  commentField() {
    return this.page.getByPlaceholder(/Enter comment/);
  }

  comment(commentText) {
    return this.page.getByText(commentText, { exact: true });
  }

  async assignMember(userName) {
    await this.addMemberButton().click();
    await this.memberSearchField().fill(userName);
    await this.memberOption(userName).click();
    await this.page.keyboard.press('Escape');
  }

  async createAndApplyLabel(labelName) {
    await this.addLabelButton().click();
    await this.labelSearchField().fill(labelName);
    await this.createNewLabelButton().click();
    await this.createLabelButton().click();
    await this.label(labelName).click();
    await this.page.keyboard.press('Escape');
  }

  async saveDefaultDueDate() {
    await this.addDueDateButton().click();
    await this.dueDateField().waitFor({ state: 'visible' });
    await this.saveButton().click();
  }

  async startTimer() {
    await this.startTimerButton().click();
  }

  async setTimerSeconds(seconds) {
    await this.editTimerButton().click();
    await this.editTimerButton().click();
    await this.timerSecondsField().fill(String(seconds));
    await this.saveButton().click();
  }

  async addDescription(description) {
    await this.addDescriptionButton().click();
    await this.descriptionField().fill(description);
    await this.saveButton().click();
  }

  async addTask(taskName) {
    await this.addTaskButton().click();
    await this.taskField().fill(taskName);
    await this.taskField().press('Enter');
  }

  async uploadAttachment(filePath) {
    await this.fileInput().setInputFiles(filePath);
  }

  async addComment(commentText) {
    await this.addCommentButton().click();
    await this.commentField().fill(commentText);
    await this.saveButton().click();
  }

  async openAction(actionName) {
    await this.editCardButton().click();
    await this.action(actionName).waitFor({ state: 'visible' });
    await this.action(actionName).click();
  }

  async closeActionStep() {
    await this.backButton().click();
    await this.page.keyboard.press('Escape');
  }

  async renameFromAction(nextName) {
    await this.openAction('Edit Name');
    await this.cardNameField().fill(nextName);
    await this.cardNameField().press('Enter');
    await this.page.keyboard.press('Escape');
  }

  async assignMemberFromAction(userName) {
    await this.openAction('Edit Members');
    await this.memberSearchField().fill(userName);
    await this.memberOption(userName).click();
    await this.closeActionStep();
  }

  async applyLabelFromAction(labelName) {
    await this.openAction('Edit Labels');
    await this.labelOption(labelName).waitFor({ state: 'visible' });
    await this.labelOption(labelName).click();
    await this.closeActionStep();
  }

  async saveDefaultDueDateFromAction() {
    await this.openAction('Edit Due Date');
    await this.dueDateField().waitFor({ state: 'visible' });
    await this.saveButton().click();
  }

  async setTimerSecondsFromAction(seconds) {
    await this.openAction('Edit Timer');
    await this.editTimerButton().click();
    await this.timerSecondsField().fill(String(seconds));
    await this.saveButton().click();
  }

  async moveToListFromAction(currentListName, targetListName) {
    await this.openAction('Move Card');
    await this.moveListDropdown(currentListName).click();
    await this.moveListOption(targetListName).click();
    await this.moveButton().click();
  }

  async duplicateFromAction() {
    await this.openAction('Duplicate Card');
  }

  async copyLinkFromAction() {
    await this.openAction('Copy Link');
  }

  async openActivityFromAction(cardName) {
    await this.openAction('Check Activity');
    await this.activityTitle(cardName).waitFor({ state: 'visible' });
  }

  async deleteFromAction() {
    await this.openAction('Delete Card');
    await this.deleteConfirmButton().click();
  }
}

module.exports = { CardModalPage };
