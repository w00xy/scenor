import Cookies from "universal-cookie";

const cookies = new Cookies();
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

function processQueue(error: any | null, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
}

async function refreshTokenFlow(): Promise<string | null> {
  const refreshToken = cookies.get("refreshToken");
  console.log("[refresh] refreshToken в куке:", refreshToken ? "есть" : "нет");
  if (!refreshToken) {
    console.error("[refresh] Нет refresh-токена");
    return null;
  }
  try {
    const response = await fetch(`${API_BASE_URL}/users/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      credentials: "include",
    });
    if (!response.ok) {
      console.error("[refresh] Ошибка ответа:", response.status);
      return null;
    }
    const data = await response.json();
    if (!data.accessToken) {
      console.error("[refresh] Нет accessToken в ответе");
      return null;
    }
    setTokens(data.accessToken, data.refreshToken);
    console.log("[refresh] Токен успешно обновлён");
    return data.accessToken;
  } catch (error) {
    console.error("[refresh] Исключение:", error);
    return null;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  requireAuth: boolean = false,
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  const getToken = () => cookies.get("accessToken");
  let token = getToken();
  if (requireAuth && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const makeRequest = () =>
    fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include",
    });

  let response = await makeRequest();

  if ((response.status === 401 || response.status === 403) && requireAuth) {
    console.log(`[request] 401 для ${endpoint}, попытка обновления токена`);

    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await refreshTokenFlow();
      isRefreshing = false;
      if (newToken) {
        headers.set("Authorization", `Bearer ${newToken}`);
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers,
          credentials: "include",
        });
        processQueue(null, newToken);
      } else {
        processQueue(new Error("Refresh failed"), null);
        clearTokens();
        window.location.href = "/auth";
        throw new Error("Session expired");
      }
    } else {
      await new Promise((resolve, reject) => {
        failedQueue.push({ resolve: resolve as any, reject });
      });

      const newToken = getToken();
      if (newToken) {
        headers.set("Authorization", `Bearer ${newToken}`);
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers,
          credentials: "include",
        });
      } else {
        throw new Error("No token after refresh");
      }
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || `HTTP ${response.status}`);
    (error as any).status = response.status;
    throw error;
  }

  return response.json();
}

export const setTokens = (accessToken: string, refreshToken: string) => {
  console.log("[setTokens] Сохранение токенов");
  cookies.set("accessToken", accessToken, { path: "/", maxAge: 15 * 60 });
  cookies.set("refreshToken", refreshToken, {
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
};

export const clearTokens = () => {
  console.log("[clearTokens] Удаление токенов");
  cookies.remove("accessToken", { path: "/" });
  cookies.remove("refreshToken", { path: "/" });
};

export const authApi = {
  register: (username: string, email: string, password: string) =>
    request<{ id: string; email: string; name: string; role: string }>(
      "/users/register",
      {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
      },
    ),

  login: (credentials: {
    email?: string;
    username?: string;
    password: string;
  }) =>
    request<{ accessToken: string; refreshToken: string; user: any }>(
      "/users/login",
      {
        method: "POST",
        body: JSON.stringify(credentials),
      },
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
      username?: string;
      email?: string;
      lastname?: string;
      phone?: string;
    },
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
      {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword }),
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

  updateProfile: (
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      bio?: string;
      phone?: string;
      avatarUrl?: string;
    },
  ) =>
    request<{
      userId: string;
      firstName: string;
      lastName: string;
      bio?: string;
      phone?: string;
      avatarUrl?: string;
    }>(
      `/profile/me`,
      {
        method: "PUT",
        body: JSON.stringify({ userId, ...data }),
      },
      true,
    ),
};
