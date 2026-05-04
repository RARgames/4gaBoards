import { test, expect } from '../fixtures';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('API Client Smoke Test', () => {
  test('should create and navigate to a fixture-provided project', async ({ page, api, testProject, runId }) => {
    expect(testProject.id).toBeTruthy();
    expect(testProject.name).toBe(`Test Project ${runId}`);

    // Verify the project exists via API
    const projects = await api.getProjects();
    const found = projects.find((p) => p.id === testProject.id);
    expect(found).toBeTruthy();
    expect(found!.name).toBe(testProject.name);
  });

  test('should create full chain: project > board > list > card', async ({ api, testProject, testBoard, testList, testCard, runId }) => {
    expect(testBoard.name).toBe(`Test Board ${runId}`);
    expect(testList.name).toBe(`Test List ${runId}`);
    expect(testCard.name).toBe(`Test Card ${runId}`);

    // Verify card has correct parent references
    expect(testCard.listId).toBe(testList.id);
    expect(testCard.boardId).toBe(testBoard.id);
  });

  test('should create labels and assign to a card', async ({ api, testBoard, testCard }) => {
    const label = await api.createLabel(testBoard.id, 'Bug', 'berry-red');
    expect(label.id).toBeTruthy();
    expect(label.name).toBe('Bug');

    await api.addCardLabel(testCard.id, label.id);
    // If no error thrown, the label was assigned successfully
  });

  test('should create a task on a card', async ({ api, testCard }) => {
    const task = await api.createTask(testCard.id, 'Fix the bug');
    expect(task.id).toBeTruthy();
    expect(task.name).toBe('Fix the bug');
    expect(task.isCompleted).toBe(false);

    const updated = await api.updateTask(task.id, { isCompleted: true });
    expect(updated.isCompleted).toBe(true);
  });

  test('should create a comment on a card', async ({ api, testCard }) => {
    const comment = await api.createComment(testCard.id, 'This is a test comment');
    expect(comment.id).toBeTruthy();
    expect(comment.data.text).toBe('This is a test comment');
  });

  test('should create a user and add as board member', async ({ api, testBoard, testUser }) => {
    expect(testUser.id).toBeTruthy();
    expect(testUser.isAdmin).toBe(false);

    const membership = await api.createBoardMembership(testBoard.id, testUser.id);
    expect(membership.id).toBeTruthy();
  });

  test('should create a user and add as project manager', async ({ api, testProject, testUser, testUserApi }) => {
    const manager = await api.createProjectManager(testProject.id, testUser.id);
    expect(manager.id).toBeTruthy();
    expect(manager.projectId).toBe(testProject.id);

    // Verify the user can access the project via their own API client
    const projects = await testUserApi.getProjects();
    const found = projects.find((p) => p.id === testProject.id);
    expect(found).toBeTruthy();
  });
});
