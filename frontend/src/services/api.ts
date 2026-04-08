import Cookies from 'universal-cookie';

const cookies = new Cookies();
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  requireAuth: boolean = false
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (requireAuth) {
    const token = cookies.get('accessToken');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    } else {
      throw new Error('No access token');
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const setTokens = (accessToken: string, refreshToken: string) => {
  cookies.set('accessToken', accessToken, { path: '/', maxAge: 15 * 60 });
  cookies.set('refreshToken', refreshToken, { path: '/', maxAge: 7 * 24 * 60 * 60 });
};

export const clearTokens = () => {
  cookies.remove('accessToken', { path: '/' });
  cookies.remove('refreshToken', { path: '/' });
};
export const authApi = {
  register: (name: string, email: string, password: string) =>
    request<{ id: string; email: string; name: string; role: string }>('/users/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (credentials: { email?: string; username?: string; password: string }) =>
    request<{ accessToken: string; refreshToken: string; user: any }>('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  refresh: (refreshToken: string) =>
    request<{ accessToken: string; refreshToken: string }>('/users/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),
    
};

export const userApi = {
  getUser: (id: string) =>
    request<{ id: string; username: string; email: string; lastname?: string; phone?: string; role: string; createdAt: string; updatedAt: string }>(
      `/users/${id}`,
      { method: 'GET' },
      true
    ),

  updateUser: (id: string, data: { username?: string; email?: string; lastname?: string; phone?: string }) =>
    request<{ id: string; username: string; email: string; lastname?: string; phone?: string }>(
      `/users/${id}`,
      { method: 'PATCH', body: JSON.stringify(data) },
      true
    ),
};