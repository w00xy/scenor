import Cookies from "universal-cookie";

const cookies = new Cookies();
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const parseJsonSafe = async (response: Response): Promise<any> => {
  if (response.status === 204) {
    return null;
  }
  return response.json().catch(() => ({}));
};

const sendRequest = async (
  endpoint: string,
  options: RequestInit,
  requireAuth: boolean,
): Promise<Response> => {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (requireAuth) {
    const token = cookies.get("accessToken");
    if (!token) {
      throw new ApiError("No access token", 401);
    }
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });
};

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  requireAuth: boolean = false,
): Promise<T> {
  const response = await sendRequest(endpoint, options, requireAuth);

  if (!response.ok) {
    const errorData = await parseJsonSafe(response);
    const error = new ApiError(
      errorData?.message || `HTTP ${response.status}`,
      response.status,
    );
    throw error;
  }

  return (await parseJsonSafe(response)) as T;
}

export const setTokens = (accessToken: string, refreshToken: string) => {
  cookies.set("accessToken", accessToken, { path: "/", maxAge: 15 * 60 });
  cookies.set("refreshToken", refreshToken, {
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
};

export const clearTokens = () => {
  cookies.remove("accessToken", { path: "/" });
  cookies.remove("refreshToken", { path: "/" });
};

export const getAccessToken = () => cookies.get("accessToken");

export const authApi = {
  register: (username: string, email: string, password: string) =>
    request<{ id: string; email: string; name: string; role: string }>(
      "/users/register",
      { method: "POST", body: JSON.stringify({ username, email, password }) },
    ),
  login: (credentials: {
    email?: string;
    username?: string;
    password: string;
  }) =>
    request<{ accessToken: string; refreshToken: string; user: any }>(
      "/users/login",
      { method: "POST", body: JSON.stringify(credentials) },
    ),
};

export const userApi = {
  getUser: (id: string) =>
    request<{
      id: string;
      username: string;
      email: string;
      lastname?: string;
      phone?: string;
      role: string;
      createdAt: string;
      updatedAt: string;
    }>(`/users/${id}`, { method: "GET" }, true),

  updateUser: (
    id: string,
    data: {
      email?: string;
    },
  ) =>
    request<{
      email: string;
    }>(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }, true),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ success: boolean }>(
      "/users/password",
      { method: "PUT", body: JSON.stringify({ currentPassword, newPassword }) },
      true,
    ),

  verifyPassword: (password: string) =>
    request<{ ok: boolean }>(
      "/users/password",
      {
        method: "POST",
        body: JSON.stringify({ password }),
      },
      true,
    ),
};

export const profileApi = {
  getProfile: (userId: string) =>
    request<{
      userId: string;
      firstName: string;
      lastName: string;
      bio?: string;
      phone?: string;
      avatarUrl?: string;
    }>(`/profile/me?id=${userId}`, { method: "GET" }, true),
  updateProfile: (data: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    phone?: string;
    avatarUrl?: string;
  }) =>
    request<{
      userId: string;
      firstName: string;
      lastName: string;
      bio?: string;
      phone?: string;
      avatarUrl?: string;
    }>(`/profile/me`, { method: "PUT", body: JSON.stringify(data) }, true),
};

export const projectApi = {
  getProjects: () =>
    request<
      Array<{
        id: string;
        ownerId: string;
        name: string;
        description: string;
        isArchived: boolean;
        type: string;
        createdAt: string;
        updatedAt: string;
        members: Array<{ role: string }>;
        accessRole: string;
      }>
    >("/projects", { method: "GET" }, true),
};
