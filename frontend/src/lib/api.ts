import type {
  AuthResponse,
  User,
  Project,
  CreateProjectDto,
  UpdateProjectDto,
  Task,
  CreateTaskDto,
  UpdateTaskDto,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }
  return res.json();
}

export const api = {
  auth: {
    register: (data: { name: string; email: string; password: string }) =>
      fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      }).then((r) => handleResponse<AuthResponse>(r)),

    login: (data: { email: string; password: string }) =>
      fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      }).then((r) => handleResponse<AuthResponse>(r)),

    me: () =>
      fetch(`${API_URL}/auth/me`, { headers: getHeaders() }).then((r) =>
        handleResponse<User>(r),
      ),
  },

  projects: {
    list: () =>
      fetch(`${API_URL}/projects`, { headers: getHeaders() }).then((r) =>
        handleResponse<Project[]>(r),
      ),

    get: (id: string) =>
      fetch(`${API_URL}/projects/${id}`, { headers: getHeaders() }).then((r) =>
        handleResponse<Project>(r),
      ),

    create: (data: CreateProjectDto) =>
      fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      }).then((r) => handleResponse<Project>(r)),

    update: (id: string, data: UpdateProjectDto) =>
      fetch(`${API_URL}/projects/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data),
      }).then((r) => handleResponse<Project>(r)),

    delete: (id: string) =>
      fetch(`${API_URL}/projects/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      }).then((r) => handleResponse<void>(r)),
  },

  tasks: {
    list: (filters?: {
      status?: string;
      priority?: string;
      projectId?: string;
    }) => {
      const params = new URLSearchParams();
      if (filters?.status) params.set('status', filters.status);
      if (filters?.priority) params.set('priority', filters.priority);
      if (filters?.projectId) params.set('projectId', filters.projectId);
      const query = params.toString() ? `?${params.toString()}` : '';
      return fetch(`${API_URL}/tasks${query}`, { headers: getHeaders() }).then(
        (r) => handleResponse<Task[]>(r),
      );
    },

    get: (id: string) =>
      fetch(`${API_URL}/tasks/${id}`, { headers: getHeaders() }).then((r) =>
        handleResponse<Task>(r),
      ),

    create: (data: CreateTaskDto) =>
      fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      }).then((r) => handleResponse<Task>(r)),

    update: (id: string, data: UpdateTaskDto) =>
      fetch(`${API_URL}/tasks/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data),
      }).then((r) => handleResponse<Task>(r)),

    delete: (id: string) =>
      fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      }).then((r) => handleResponse<void>(r)),
  },
};
