import { test, expect } from '../../fixtures';

test.describe('Projects - View', () => {
  test('should display a project on the dashboard', async ({ page, testProject }) => {
    await page.goto('/');

    // Project appears in sidebar
    await expect(page.locator(`a[href="/projects/${testProject.id}"]`).first()).toBeVisible();

    // Project appears in main content
    await expect(page.getByText(testProject.name, { exact: true }).first()).toBeVisible();
  });
});

test.describe('Projects - Filter', () => {
  test('should filter projects by name in the sidebar', async ({ page, testProject }) => {
    await page.goto('/');

    const filterInput = page.getByPlaceholder('Filter projects...');

    // Filter by fixture project name — it should remain visible
    await filterInput.fill(testProject.name);
    await expect(page.locator(`a[href="/projects/${testProject.id}"]`).first()).toBeVisible();

    // Filter by nonsense — fixture project should disappear
    await filterInput.clear();
    await filterInput.fill('NonExistent_zzz_xyz');
    await expect(page.locator(`a[href="/projects/${testProject.id}"]`).first()).not.toBeVisible();
  });
});

test.describe('Projects - Create', () => {
  test('should create a new project', async ({ page, api, runId }) => {
    const projectName = `New Project ${runId}`;

    await page.goto('/');

    // Click Add Project in sidebar
    await page.getByRole('button', { name: 'Add Project' }).first().click();

    // Fill in the project name and submit
    const popup = page.getByRole('dialog');
    await expect(popup).toBeVisible();
    await popup.getByPlaceholder('Enter project name...').fill(projectName);
    await popup.getByRole('button', { name: 'Add Project' }).click();

    // Verify the new project appears in the sidebar
    await expect(page.getByText(projectName, { exact: true }).first()).toBeVisible();

    // Cleanup: find and delete the created project via API
    const projects = await api.getProjects();
    const created = projects.find((p) => p.name === projectName);
    if (created) await api.deleteProject(created.id);
  });
});

test.describe('Projects - Add Board from Sidebar', () => {
  test('should add a board from the sidebar', async ({ page, testProject, runId }) => {
    const boardName = `New Board ${runId}`;

    await page.goto('/');

    // Click Add Board in sidebar
    await page.getByRole('button', { name: 'Add Board' }).first().click();

    // Fill in the board name
    const popup = page.getByRole('dialog');
    await expect(popup).toBeVisible();
    await popup.getByPlaceholder('Enter board name...').fill(boardName);

    // Select the fixture project in the project dropdown
    await popup.getByPlaceholder('Select project').click();
    // The dropdown options appear in a separate popup
    const dropdownPopup = page.getByRole('dialog').last();
    await dropdownPopup.getByText(testProject.name, { exact: true }).click();

    // Submit
    await popup.getByRole('button', { name: 'Add Board' }).click();

    // Verify the new board appears in the sidebar under the project
    await expect(page.getByText(boardName, { exact: true }).first()).toBeVisible();
  });
});
