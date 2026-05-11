class HeaderPage {
  constructor(page) {
    this.page = page;
  }

  settingsButton() {
    return this.page.getByRole('link', { name: 'Settings', exact: true }).getByRole('button');
  }

  usersButton() {
    return this.page.getByRole('link', { name: 'Settings: Users' }).getByRole('button');
  }

  notificationsButton() {
    return this.page.locator('button[title="Notifications"]');
  }

  profileAndSettingsButton() {
    return this.page.locator('[class*="Header_menuRight"]').getByRole('button').last();
  }

  profileMenu() {
    return this.page.locator('[role="dialog"][data-prevent-card-switch="true"]').last();
  }

  menuItem(name) {
    return this.profileMenu().getByRole('button', { name, exact: true });
  }

  headerTitle(title) {
    return this.page.locator('[class*="Header_title"]').filter({ hasText: title });
  }

  openNotificationCenterButton() {
    return this.profileMenu().getByRole('button', { name: 'Open Notification Center' });
  }
}

module.exports = { HeaderPage };
