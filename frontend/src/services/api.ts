import Cookies from "universal-cookie";

const cookies = new Cookies();
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  requireAuth: boolean = false
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (requireAuth) {
    const token = cookies.get("accessToken");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    } else {
      throw new Error("No access token");
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || `HTTP ${response.status}`);
    (error as any).status = response.status;
    throw error;
  }

  return response.json();
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
  const refreshToken = cookies.get("refreshToken");
  console.log("[refreshTokenFlow] refreshToken exists?", !!refreshToken);
  if (!refreshToken) return false;
  try {
    const response = await fetch(`${API_BASE_URL}/users/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      credentials: "include",
    });
    console.log("[refreshTokenFlow] response status:", response.status);
    if (!response.ok) return false;
    const data = await response.json();
    if (!data.accessToken) return false;
    setTokens(data.accessToken, data.refreshToken);
    console.log("[refreshTokenFlow] tokens updated");
    return true;
  } catch (error) {
    console.error("[refreshTokenFlow] error:", error);
    return false;
  }
}

export const getAccessToken = () => cookies.get("accessToken");

export const authApi = {
  register: (username: string, email: string, password: string) =>
    request<{ id: string; email: string; name: string; role: string }>(
      "/users/register",
      { method: "POST", body: JSON.stringify({ username, email, password }) }
    ),
  login: (credentials: { email?: string; username?: string; password: string }) =>
    request<{ accessToken: string; refreshToken: string; user: any }>(
      "/users/login",
      { method: "POST", body: JSON.stringify(credentials) }
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
    data: { username?: string; email?: string; lastname?: string; phone?: string }
  ) =>
    request<{
      id: string;
      username: string;
      email: string;
      lastname?: string;
      phone?: string;
    }>(`/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }, true),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ success: boolean }>(
      "/users/password",
      { method: "PUT", body: JSON.stringify({ currentPassword, newPassword }) },
      true
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