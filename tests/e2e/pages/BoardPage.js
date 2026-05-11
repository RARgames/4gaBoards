class BoardPage {
  constructor(page) {
    this.page = page;
  }

  addBoardButton() {
    return this.page.getByRole('button', { name: 'Add Board' }).last();
  }

  addListButton() {
    return this.page.getByRole('button', { name: /Add list/i });
  }

  addCardButton() {
    return this.page.getByRole('button', { name: 'Add card' }).first();
  }

  templateField(templateName = 'Empty') {
    return this.page.getByPlaceholder(templateName);
  }

  templateOption(templateName) {
    return this.page.locator(`[name="${templateName}"]`);
  }

  importBoardButton() {
    return this.page.getByRole('button', { name: 'Import' });
  }

  importSourceButton(sourceName) {
    return this.page.getByRole('button', { name: sourceName });
  }

  boardNameField() {
    return this.page.getByPlaceholder('Enter board name...');
  }

  boardTitle(boardName) {
    return this.page.getByTitle(boardName).last();
  }

  listNameField() {
    return this.page.getByPlaceholder('Enter list name...');
  }

  cardNameField() {
    return this.page.getByPlaceholder(/Enter card name/).first();
  }

  card(cardName) {
    return this.page.getByRole('button').filter({ hasText: cardName }).first();
  }

  cardText(cardName) {
    return this.page.getByText(cardName, { exact: true }).first();
  }

  list(listName) {
    return this.page.getByText(listName, { exact: true });
  }

  cardModalCloseButton() {
    return this.page.getByRole('button', { name: 'Close Card' });
  }

  cardModalTitle(cardName) {
    return this.page.locator('[class*="CardModal_headerTitle__"]').filter({ hasText: cardName });
  }

  cardEditButton() {
    return this.page.getByRole('button', { name: 'Edit Card' }).last();
  }

  boardEditButton() {
    return this.page.getByRole('button', { name: 'Edit Board' }).last();
  }

  boardAction(actionName) {
    return this.page.getByRole('button', { name: actionName }).last();
  }

  projectSettingsButton() {
    return this.page.getByRole('button', { name: 'Project Settings' });
  }

  backToProjectButton() {
    return this.page.getByRole('button', { name: 'Back to project' });
  }

  cardCountText(countText) {
    return this.page.getByText(countText, { exact: true }).first();
  }

  cardCount() {
    return this.page.locator('[class*="BoardActions_cardsCount"]').first();
  }

  githubStatusIcon(status) {
    return this.page.getByTitle(status);
  }

  githubConnectionControl() {
    return this.page.locator('[class*="BoardActions_githubAction"]').last();
  }

  filterCardsField() {
    return this.page.getByPlaceholder('Filter cards...');
  }

  matchCaseButton() {
    return this.page.getByRole('button', { name: 'Match Case' });
  }

  anyMatchButton() {
    return this.page.getByRole('button', { name: 'Any Match [Alt+V]' });
  }

  filterByMembersButton() {
    return this.page.getByRole('button', { name: 'Filter By Members' });
  }

  filterByLabelsButton() {
    return this.page.getByRole('button', { name: 'Filter By Labels' });
  }

  filterByNotificationsButton() {
    return this.page.getByRole('button', { name: 'Filter by Notifications' });
  }

  filterByDueDateButton() {
    return this.page.getByRole('button', { name: 'Filter by Due Date' });
  }

  switchToListViewButton() {
    return this.page.getByRole('button', { name: 'Switch to List View' });
  }

  switchToBoardViewButton() {
    return this.page.getByRole('button', { name: 'Switch to Board View' });
  }

  listViewColumnHeader(headerName) {
    return this.page.getByRole('columnheader', { name: headerName });
  }

  listViewRow(cardName) {
    return this.page.getByRole('row').filter({ hasText: cardName }).first();
  }

  listViewOpenCell(cardName) {
    return this.listViewRow(cardName).getByRole('cell').nth(5);
  }

  listViewPagination() {
    return this.page.locator('[class*="Table_pagination"]').first();
  }

  listViewPageField() {
    return this.listViewPagination().locator('input[name="page"]');
  }

  listViewPageCount(pageCount) {
    return this.listViewPagination().getByText(`/${pageCount}`);
  }

  listViewNextPageButton() {
    return this.listViewPagination().getByRole('button', { name: 'Next Page' });
  }

  listViewItemsPerPageField() {
    return this.listViewPagination().locator('[class*="Table_paginationDropdown"] input');
  }

  listViewItemsPerPageOption(optionName) {
    return this.page.locator('[class*="Dropdown_dropdownItem"]').filter({ hasText: optionName }).first();
  }

  async selectListViewItemsPerPage(optionName) {
    await this.listViewItemsPerPageField().click();
    await this.listViewItemsPerPageOption(optionName).click();
    await this.listViewItemsPerPageField().waitFor({ state: 'visible' });
  }

  addUserButton() {
    return this.page.getByRole('button', { name: 'Add user' }).last();
  }

  userSearchField() {
    return this.page.getByPlaceholder('Search users...');
  }

  userMenuItem(userName) {
    return this.page.getByRole('button').filter({ hasText: userName }).last();
  }

  memberAvatar(userName) {
    return this.page.getByTitle(userName).first();
  }

  memberPermission(permissionName) {
    return this.page.getByRole('button', { name: new RegExp(permissionName, 'i') });
  }

  addDescriptionButton() {
    return this.page.getByRole('button').filter({ hasText: 'Add description' });
  }

  descriptionField() {
    return this.page.getByPlaceholder('Enter description...');
  }

  saveButton() {
    return this.page.getByRole('button', { name: 'Save' });
  }

  descriptionText(description) {
    return this.page.getByText(description);
  }

  listSelectorCurrentValue(listName) {
    return this.page.getByText(listName, { exact: true }).last();
  }

  listSelectorOption(listName) {
    return this.page.locator(`[name="${listName}"]`);
  }

  templateLists(templateName) {
    return {
      Simple: ['Open', 'Todo', 'In Progress', 'Done'],
      Kanban: ['Open', 'Todo', 'In Progress', 'To Test', 'Done'],
    }[templateName] || [];
  }

  async gotoProject(projectId) {
    await this.page.goto(`/projects/${projectId}`);
  }

  async gotoBoard(boardId) {
    await this.page.goto(`/boards/${boardId}`);
  }

  async ensureBoardView() {
    if (await this.switchToBoardViewButton().isVisible().catch(() => false)) {
      await this.switchToBoardViewButton().click();
    }

    await this.switchToListViewButton().waitFor({ state: 'visible' });
  }

  async createBoard(boardName) {
    await this.addBoardButton().click();
    await this.boardNameField().fill(boardName);
    await this.boardNameField().press('Enter');
    await this.ensureBoardView();
    await this.addListButton().waitFor({ state: 'visible' });
  }

  async createBoardFromTemplate(boardName, templateName) {
    await this.addBoardButton().click();
    await this.boardNameField().fill(boardName);
    await this.templateField().click();
    await this.templateOption(templateName).click();
    await this.page.getByRole('dialog').getByRole('button', { name: 'Add Board' }).click();
    await this.ensureBoardView();
    await this.waitForTemplateLists(templateName);
    await this.addListButton().waitFor({ state: 'visible' });
  }

  async waitForTemplateLists(templateName) {
    const expectedLists = this.templateLists(templateName);

    if (!expectedLists.length) {
      return;
    }

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const missingLists = [];

      for (const listName of expectedLists) {
        if ((await this.list(listName).first().count()) === 0) {
          missingLists.push(listName);
        }
      }

      if (!missingLists.length) {
        return;
      }

      await this.page.reload();
      await this.ensureBoardView();
    }

    for (const listName of expectedLists) {
      await this.list(listName).first().waitFor({ state: 'attached' });
    }
  }

  async createList(listName) {
    await this.addListButton().click();
    await this.listNameField().fill(listName);
    await this.page.getByRole('button', { name: 'Add list' }).click();
  }

  async createCard(cardName) {
    await this.addCardButton().click();
    await this.cardNameField().fill(cardName);
    await this.cardNameField().press('Enter');
    await this.card(cardName).waitFor({ state: 'visible' });
  }

  async openCard(cardName) {
    await this.card(cardName).waitFor({ state: 'visible' });
    await this.card(cardName).click();
  }

  async ensureCardModalOpen(cardName) {
    if (!(await this.cardModalCloseButton().isVisible())) {
      await this.openCard(cardName);
    }

    await this.cardModalCloseButton().waitFor({ state: 'visible' });
  }

  async addDescription(description) {
    await this.addDescriptionButton().click();
    await this.descriptionField().fill(description);
    await this.saveButton().click();
  }
}

module.exports = { BoardPage };
