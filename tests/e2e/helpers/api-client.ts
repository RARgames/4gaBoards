/**
 * 4gaBoards API Client for E2E test setup and teardown.
 *
 * Wraps the REST API at /api/... using plain HTTP.
 * Reference: /client/src/api/ for endpoint paths and data shapes.
 *
 * Usage:
 *   const api = await ApiClient.login('http://localhost:3000', 'demo', 'demo');
 *   const project = await api.createProject('My Project');
 *   await api.deleteProject(project.id); // cascade deletes boards/lists/cards
 */

export interface Project {
  id: string;
  name: string;
  background: string | null;
}

export interface Board {
  id: string;
  name: string;
  projectId: string;
  position: number;
}

export interface List {
  id: string;
  name: string;
  boardId: string;
  position: number;
}

export interface Card {
  id: string;
  name: string;
  listId: string;
  boardId: string;
  position: number;
  description: string | null;
  dueDate: string | null;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  boardId: string;
  position: number;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  isAdmin: boolean;
}

export interface Task {
  id: string;
  name: string;
  isCompleted: boolean;
  cardId: string;
  position: number;
}

export interface Comment {
  id: string;
  data: { text: string; userId: string; userName: string };
  cardId: string;
}

export interface BoardMembership {
  id: string;
  boardId: string;
  userId: string;
  role: string;
}

export interface ProjectManager {
  id: string;
  projectId: string;
  userId: string;
}

export class ApiClient {
  private constructor(
    private baseUrl: string,
    private token: string,
  ) {}

  /**
   * Authenticate and return a ready-to-use ApiClient.
   */
  static async login(baseUrl: string, emailOrUsername: string, password: string): Promise<ApiClient> {
    const formData = new FormData();
    formData.append('emailOrUsername', emailOrUsername);
    formData.append('password', password);

    const res = await fetch(`${baseUrl}/api/access-tokens`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Login failed (${res.status}): ${body}`);
    }

    const { item: token } = await res.json();
    return new ApiClient(baseUrl, token);
  }

  // ─── HTTP helpers ───

  private async request<T>(method: string, path: string, body?: Record<string, unknown>): Promise<T> {
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    };

    if (body && (method !== 'GET' && method !== 'DELETE')) {
      options.body = JSON.stringify(body);
    }

    const res = await fetch(`${this.baseUrl}/api${path}`, options);

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API ${method} ${path} failed (${res.status}): ${text}`);
    }

    return res.json();
  }

  private async get<T>(path: string): Promise<T> {
    return this.request('GET', path);
  }

  private async post<T>(path: string, body: Record<string, unknown>): Promise<T> {
    return this.request('POST', path, body);
  }

  private async patch<T>(path: string, body: Record<string, unknown>): Promise<T> {
    return this.request('PATCH', path, body);
  }

  private async del<T>(path: string): Promise<T> {
    return this.request('DELETE', path);
  }

  // ─── Projects ───

  async getProjects(): Promise<Project[]> {
    const data = await this.get<{ items: Project[] }>('/projects');
    return data.items;
  }

  async createProject(name: string): Promise<Project> {
    const data = await this.post<{ item: Project }>('/projects', { name });
    return data.item;
  }

  async updateProject(id: string, updates: { name?: string; background?: string }): Promise<Project> {
    const data = await this.patch<{ item: Project }>(`/projects/${id}`, updates);
    return data.item;
  }

  async deleteProject(id: string): Promise<void> {
    await this.del(`/projects/${id}`);
  }

  // ─── Boards ───

  async createBoard(projectId: string, name: string, position = 1): Promise<Board> {
    const data = await this.post<{ item: Board }>(`/projects/${projectId}/boards`, {
      name,
      position,
      isGithubConnected: false,
    });
    return data.item;
  }

  async updateBoard(id: string, updates: Record<string, unknown>): Promise<Board> {
    const data = await this.patch<{ item: Board }>(`/boards/${id}`, updates);
    return data.item;
  }

  async deleteBoard(id: string): Promise<void> {
    await this.del(`/boards/${id}`);
  }

  // ─── Lists ───

  async createList(boardId: string, name: string, position = 1): Promise<List> {
    const data = await this.post<{ item: List }>(`/boards/${boardId}/lists`, {
      name,
      position,
      isCollapsed: false,
    });
    return data.item;
  }

  async updateList(id: string, updates: Record<string, unknown>): Promise<List> {
    const data = await this.patch<{ item: List }>(`/lists/${id}`, updates);
    return data.item;
  }

  async deleteList(id: string): Promise<void> {
    await this.del(`/lists/${id}`);
  }

  // ─── Cards ───

  async createCard(listId: string, name: string, position = 1): Promise<Card> {
    const data = await this.post<{ item: Card }>(`/lists/${listId}/cards`, {
      name,
      position,
    });
    return data.item;
  }

  async updateCard(id: string, updates: Record<string, unknown>): Promise<Card> {
    const data = await this.patch<{ item: Card }>(`/cards/${id}`, updates);
    return data.item;
  }

  async deleteCard(id: string): Promise<void> {
    await this.del(`/cards/${id}`);
  }

  // ─── Labels ───

  async createLabel(boardId: string, name: string, color: string, position = 1): Promise<Label> {
    const data = await this.post<{ item: Label }>(`/boards/${boardId}/labels`, {
      name,
      color,
      position,
    });
    return data.item;
  }

  async updateLabel(id: string, updates: { name?: string; color?: string }): Promise<Label> {
    const data = await this.patch<{ item: Label }>(`/labels/${id}`, updates);
    return data.item;
  }

  async deleteLabel(id: string): Promise<void> {
    await this.del(`/labels/${id}`);
  }

  // ─── Card Labels ───

  async addCardLabel(cardId: string, labelId: string): Promise<void> {
    await this.post(`/cards/${cardId}/labels`, { labelId });
  }

  async removeCardLabel(cardId: string, labelId: string): Promise<void> {
    await this.del(`/cards/${cardId}/labels/${labelId}`);
  }

  // ─── Card Memberships ───

  async addCardMember(cardId: string, userId: string): Promise<void> {
    await this.post(`/cards/${cardId}/memberships`, { userId });
  }

  async removeCardMember(cardId: string, userId: string): Promise<void> {
    await this.del(`/cards/${cardId}/memberships?userId=${userId}`);
  }

  // ─── Board Memberships ───

  async createBoardMembership(boardId: string, userId: string, role = 'editor'): Promise<BoardMembership> {
    const data = await this.post<{ item: BoardMembership }>(`/boards/${boardId}/memberships`, {
      userId,
      role,
    });
    return data.item;
  }

  async deleteBoardMembership(id: string): Promise<void> {
    await this.del(`/board-memberships/${id}`);
  }

  // ─── Project Managers ───

  async createProjectManager(projectId: string, userId: string): Promise<ProjectManager> {
    const data = await this.post<{ item: ProjectManager }>(`/projects/${projectId}/managers`, {
      userId,
    });
    return data.item;
  }

  async deleteProjectManager(id: string): Promise<void> {
    await this.del(`/project-managers/${id}`);
  }

  // ─── Tasks ───

  async createTask(cardId: string, name: string, position = 1): Promise<Task> {
    const data = await this.post<{ item: Task }>(`/cards/${cardId}/tasks`, {
      name,
      position,
      isCompleted: false,
    });
    return data.item;
  }

  async updateTask(id: string, updates: { name?: string; isCompleted?: boolean }): Promise<Task> {
    const data = await this.patch<{ item: Task }>(`/tasks/${id}`, updates);
    return data.item;
  }

  async deleteTask(id: string): Promise<void> {
    await this.del(`/tasks/${id}`);
  }

  // ─── Comments ───

  async createComment(cardId: string, text: string): Promise<Comment> {
    const data = await this.post<{ item: Comment }>(`/cards/${cardId}/comments`, { text });
    return data.item;
  }

  async deleteComment(id: string): Promise<void> {
    await this.del(`/comments/${id}`);
  }

  // ─── Users ───

  async getUsers(): Promise<User[]> {
    const data = await this.get<{ items: User[] }>('/users');
    return data.items;
  }

  async getCurrentUser(): Promise<User> {
    const data = await this.get<{ item: User }>('/users/me');
    return data.item;
  }

  async createUser(params: {
    name: string;
    username: string;
    email: string;
    password: string;
  }): Promise<User> {
    const data = await this.post<{ item: User }>('/users', params);
    return data.item;
  }

  async deleteUser(id: string): Promise<void> {
    await this.del(`/users/${id}`);
  }
}
