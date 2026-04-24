import {
  IWorldOptions,
  setWorldConstructor,
  World
} from '@cucumber/cucumber';

import {
  Browser,
  BrowserContext,
  Page
} from '@playwright/test';

import { LoginPage } from '../pages/LoginPage';

export class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;

  loginPage!: LoginPage;

  users: Record<string, unknown> = {};
  meetings: Record<string, unknown> = {};
  scenarioData: Record<string, unknown> = {};


  constructor(options: IWorldOptions) {
    super(options);
  }

  initPages(): void {
    this.loginPage = new LoginPage(this.page);
  }

  setData(key: string, value: unknown): void {
    this.scenarioData[key] = value;
  }

  getData<T>(key: string): T {
    return this.scenarioData[key] as T;
  }
}

setWorldConstructor(CustomWorld);
