import { test, expect } from '../../fixtures';
import { loginAs } from '../../helpers/auth';

// Role tests log in as non-admin users — need fresh browser state
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Roles - Non-Admin Restrictions', () => {
  test('should not show Settings: Users link in header', async ({ page, testUser }) => {
    await loginAs(page, testUser.username, testUser.password);

    // Non-admin header should have Settings but NOT Settings: Users
    await expect(page.locator('a[href="/settings"]')).toBeVisible();
    await expect(page.locator('a[href="/settings/users"]')).not.toBeVisible();
  });

  test('should deny access to user management page', async ({ page, testUser }) => {
    await loginAs(page, testUser.username, testUser.password);

    // Navigate directly to the users settings page
    await page.goto('/settings/users');

    // Should see authorization error
    await expect(
      page.getByRole('heading', { name: 'You are not authorized to edit instance users!' }),
    ).toBeVisible();
  });

  test('should not show Instance Settings or Users in settings sidebar', async ({
    page,
    testUser,
  }) => {
    await loginAs(page, testUser.username, testUser.password);

    await page.goto('/settings/profile');

    // Personal settings links should be visible
    await expect(page.getByRole('link', { name: 'Profile' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Preferences' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Account' })).toBeVisible();

    // Admin-only links should not exist
    await expect(page.getByRole('link', { name: 'Instance Settings' })).not.toBeVisible();
    await expect(page.getByRole('link', { name: 'Users' })).not.toBeVisible();
  });
});

test.describe('Roles - Project Access', () => {
  test('should deny access to a project the user is not a member of', async ({
    page,
    testUser,
    testProject,
  }) => {
    await loginAs(page, testUser.username, testUser.password);

    // Navigate directly to another user's project settings
    await page.goto(`/projects/${testProject.id}/settings`);

    // Should show Project Not Found
    await expect(page.getByRole('heading', { name: 'Project Not Found' })).toBeVisible();
  });

  test('should allow a project manager to access project settings', async ({
    page,
    api,
    testUser,
    testProject,
  }) => {
    // Add testUser as a project manager via admin API
    await api.createProjectManager(testProject.id, testUser.id);

    await loginAs(page, testUser.username, testUser.password);

    // Navigate to the project settings
    await page.goto(`/projects/${testProject.id}/settings`);

    // Should see the project settings page with the project name
    await expect(page.getByRole('heading', { name: 'Project Settings' })).toBeVisible();
    await expect(page.getByPlaceholder('Enter project name...')).toHaveValue(testProject.name);
  });
});
