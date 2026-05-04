import { test, expect } from '../../fixtures';

test.describe('Project Settings - View', () => {
  test('should view project settings', async ({ page, testProject }) => {
    await page.goto(`/projects/${testProject.id}/settings`);

    // Heading visible
    await expect(page.getByRole('heading', { name: 'Project Settings' })).toBeVisible();

    // Project name in the Name field
    const nameInput = page.getByPlaceholder('Enter project name...');
    await expect(nameInput).toHaveValue(testProject.name);

    // Managers section visible
    await expect(page.getByText('Managers')).toBeVisible();

    // Background section visible
    await expect(page.getByText('Background')).toBeVisible();

    // Danger Zone with Delete Project
    await expect(page.getByRole('heading', { name: 'Danger Zone' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete Project' })).toBeVisible();
  });
});

test.describe('Project Settings - Rename', () => {
  test('should rename a project', async ({ page, testProject, runId }) => {
    const newName = `Renamed ${runId}`;

    await page.goto(`/projects/${testProject.id}/settings`);

    // Clear name and type new one
    const nameInput = page.getByPlaceholder('Enter project name...');
    await nameInput.clear();
    await nameInput.fill(newName);

    // Save button should be enabled now
    const saveButton = page.getByRole('button', { name: 'Save' });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // Verify the name updated in the sidebar
    await expect(page.locator(`a[href="/projects/${testProject.id}"]`).first().getByText(newName)).toBeVisible();
  });
});

test.describe('Project Settings - Add Manager', () => {
  test('should add a manager to a project', async ({ page, testProject, testUser }) => {
    await page.goto(`/projects/${testProject.id}/settings`);

    // Click Add user
    await page.locator('button[title="Add user"]').click();

    // Popup appears with "Add Manager" header
    const popup = page.getByRole('dialog');
    await expect(popup).toBeVisible();
    await expect(popup.getByText('Add Manager')).toBeVisible();

    // Search for the test user
    await popup.getByPlaceholder('Search users...').fill(testUser.name);

    // Click the test user button (popup auto-closes after selection)
    await popup.getByRole('button', { name: testUser.name }).click();

    // Verify the user appears in the Managers section (shown as avatar with title)
    await expect(page.locator(`[title="${testUser.name}"]`).first()).toBeVisible();
  });
});
