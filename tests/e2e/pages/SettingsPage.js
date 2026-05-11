const { expect } = require('@playwright/test');

class SettingsPage {
  constructor(page, headerPage) {
    this.page = page;
    this.headerPage = headerPage;
  }

  async openFromAvatar(menuLabel, expectedUrlPattern, expectedHeader) {
    await this.headerPage.profileAndSettingsButton().click();
    await this.headerPage.menuItem(menuLabel).click();
    await expect(this.page).toHaveURL(expectedUrlPattern);
    await expect(this.headerPage.headerTitle(expectedHeader)).toBeVisible();
  }

  row(label) {
    return this.page.getByRole('row').filter({ has: this.page.getByText(label, { exact: true }) }).first();
  }

  rowCurrentValue(label) {
    return this.row(label).locator('td').nth(2);
  }

  async rowCurrentValueText(label) {
    return (await this.rowCurrentValue(label).innerText()).trim();
  }

  rowCheckbox(label) {
    return this.row(label).locator('input[type="checkbox"]').first();
  }

  rowCheckboxControl(label) {
    return this.row(label).locator('label').first();
  }

  async toggleBooleanSetting(label) {
    const currentValue = this.rowCurrentValue(label);
    const before = await this.rowCurrentValueText(label);
    const expectedAfter = before === 'Enabled' ? 'Disabled' : 'Enabled';

    await this.rowCheckboxControl(label).click();
    await expect(currentValue).toHaveText(expectedAfter);

    return before;
  }

  async selectDropdownSetting(label, optionName) {
    await this.row(label).getByRole('textbox').click();
    await this.page.locator('[class*="Dropdown_dropdownItem"]').filter({ hasText: optionName }).first().click();
    await expect(this.rowCurrentValue(label)).toHaveText(optionName);
  }

  async selectAlternateDropdownSetting(label, optionNames) {
    const originalValue = await this.rowCurrentValueText(label);
    const nextValue = optionNames.find((optionName) => optionName !== originalValue);

    if (!nextValue) {
      throw new Error(`No alternate option defined for ${label}; current value is ${originalValue}`);
    }

    await this.selectDropdownSetting(label, nextValue);

    return originalValue;
  }

  async selectThemeShape(optionName) {
    await this.row('Theme Shape').getByRole('button', { name: optionName }).click();
    await expect(this.rowCurrentValue('Theme Shape')).toHaveText(optionName);
  }

  async toggleNotificationType(optionName) {
    const row = this.row('Notification Types');
    const checkbox = row.getByRole('checkbox', { name: optionName });
    const wasChecked = await checkbox.isChecked();

    await row.locator('label').filter({ hasText: optionName }).click();
    await expect(checkbox).toBeChecked({ checked: !wasChecked });

    return wasChecked;
  }

  profileField(name) {
    return this.page.locator(`input[name="${name}"]`);
  }

  popup() {
    return this.page.locator('[role="dialog"][data-prevent-card-switch="true"]').last();
  }
}

module.exports = { SettingsPage };
