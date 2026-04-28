import { DataTable } from '@cucumber/cucumber';
import { Locator, Page } from '@playwright/test';

export class ProjectPage {
  private readonly page: Page;
  public readonly baseUrl: string;
  public readonly projectUrl: string;

  private readonly addProjectSelector: Locator;
  private readonly projectNameSelector: Locator;
  private readonly projectBtnSelector: Locator;
  public readonly addBoardSelector: Locator;
  constructor(page: Page) {
    this.page = page;
    this.baseUrl = 'http://localhost:3000/';
    this.projectUrl = 'http://localhost:3000/projects/1763160898207221052';
    this.addProjectSelector = this.page.locator('.Projects_addButton__Wwa-t');
    this.projectNameSelector = this.page.getByRole('textbox', { name: 'Enter project name...' });
    this.projectBtnSelector = this.page.locator('.Button_submit__6X4EX');
    this.addBoardSelector = this.page.getByRole('button', { name: 'Project Settings' });
  }
  public async navigateToDashboard(): Promise<void> {
    await this.page.goto(`${this.baseUrl}`);
  }
  public async dashboard(dataTable: DataTable): Promise<void> {
    const data = dataTable.hashes();
    await Promise.all([this.page.waitForLoadState('networkidle'), this.addProjectSelector.click()]);
    await this.projectNameSelector.fill(data[0].name);
    await Promise.all([this.page.waitForLoadState('networkidle'), this.projectBtnSelector.click()]);
  }
  public async navigateToProjects(): Promise<void> {
    await this.page.goto(`${this.projectUrl}`);
  }
}
