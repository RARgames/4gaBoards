import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

import { CustomWorld } from '../support/customWorld';
import { ProjectPage } from '../pages/Projectpage';
import { LoginPage } from '../pages/LoginPage';
Given('the admin is on the dashboard page', async function (this: CustomWorld) {
  this.projectPage = new ProjectPage(this.page);
  console.log(this.projectPage.baseUrl);
  await this.projectPage.navigateToDashboard();
  await expect(this.page).toHaveURL(`${this.projectPage.baseUrl}`);
});
When('the admin creates a project with the following details', async function (this: CustomWorld, dataTable: DataTable) {
  if (!this.projectPage) {
    this.projectPage = new ProjectPage(this.page);
  }
  await this.projectPage.dashboard(dataTable);
});
Then('the project "TestProject" should be visible on the dashboard', async function (this: CustomWorld) {
  if (!this.projectPage) {
    this.projectPage = new ProjectPage(this.page);
  }

  await expect(this.projectPage.addBoardSelector).toBeVisible();
});
