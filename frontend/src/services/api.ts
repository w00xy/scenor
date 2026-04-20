import Cookies from "universal-cookie";

const cookies = new Cookies();
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const RETRY_STATUS_UNAUTHORIZED = 401;

class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

let refreshPromise: Promise<boolean> | null = null;

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
      throw new ApiError("No access token", RETRY_STATUS_UNAUTHORIZED);
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
  const execute = async (): Promise<Response> =>
    sendRequest(endpoint, options, requireAuth);

  let response: Response;
  try {
    response = await execute();
  } catch (error) {
    if (
      requireAuth &&
      error instanceof ApiError &&
      error.status === RETRY_STATUS_UNAUTHORIZED
    ) {
      const refreshed = await refreshTokenFlow();
      if (!refreshed) {
        throw error;
      }
      response = await execute();
    } else {
      throw error;
    }
  }

  if (requireAuth && response.status === RETRY_STATUS_UNAUTHORIZED) {
    const refreshed = await refreshTokenFlow();
    if (refreshed) {
      response = await execute();
    }
  }

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

export async function refreshTokenFlow(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken = cookies.get("refreshToken");
    if (!refreshToken) {
      clearTokens();
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
        credentials: "include",
      });

      if (!response.ok) {
        clearTokens();
        return false;
      }

      const data = await parseJsonSafe(response);
      if (!data?.accessToken || !data?.refreshToken) {
        clearTokens();
        return false;
      }

      setTokens(data.accessToken, data.refreshToken);
      return true;
    } catch (error) {
      console.error("[refreshTokenFlow] error:", error);
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

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
  refresh: (refreshToken: string) =>
    request<{ accessToken: string; refreshToken: string }>("/users/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),
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
