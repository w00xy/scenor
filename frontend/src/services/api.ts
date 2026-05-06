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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  getProject: (projectId: string) =>
    request<{
      id: string;
      ownerId: string;
      name: string;
      description: string | null;
      isArchived: boolean;
      type: string;
      createdAt: string;
      updatedAt: string;
      members: Array<{ role: string }>;
      accessRole: string;
    }>(`/projects/${projectId}`, { method: "GET" }, true),

  createProject: (data: { name: string; description: string }) =>
    request<{
      id: string;
      ownerId: string;
      name: string;
      description: string | null;
      isArchived: boolean;
      type: string;
      createdAt: string;
      updatedAt: string;
      members: Array<{ role: string }>;
      accessRole: string;
    }>("/projects", { method: "POST", body: JSON.stringify(data) }, true),

  updateProject: (projectId: string, data: { name?: string; description?: string }) =>
    request<{
      id: string;
      ownerId: string;
      name: string;
      description: string | null;
      isArchived: boolean;
      type: string;
      createdAt: string;
      updatedAt: string;
      members: Array<{ role: string }>;
      accessRole: string;
    }>(`/projects/${projectId}`, { method: "PUT", body: JSON.stringify(data) }, true),

  deleteProject: (projectId: string) =>
    request<{
      id: string;
      ownerId: string;
      name: string;
      description: string | null;
      isArchived: boolean;
      type: string;
      createdAt: string;
      updatedAt: string;
      members: Array<{ role: string }>;
      accessRole: string;
    }>(`/projects/${projectId}`, { method: "DELETE" }, true),
};

export const workflowApi = {
  createWorkflow: (projectId: string, data: {
    name: string;
    description?: string;
    status?: string;
    isPublic?: boolean;
  }) =>
    request<{
      id: string;
      projectId: string;
      createdBy: string;
      name: string;
      description: string | null;
      status: string;
      version: number;
      isPublic: boolean;
      createdAt: string;
      updatedAt: string;
    }>(`/projects/${projectId}/workflows`, { method: "POST", body: JSON.stringify(data) }, true),

  getWorkflow: (workflowId: string) =>
    request<{
      id: string;
      projectId: string;
      createdBy: string;
      name: string;
      description: string | null;
      status: string;
      version: number;
      isPublic: boolean;
      createdAt: string;
      updatedAt: string;
    }>(`/workflows/${workflowId}`, { method: "GET" }, true),

  updateWorkflow: (workflowId: string, data: {
    name?: string;
    description?: string;
    status?: string;
    isPublic?: boolean;
  }) =>
    request<{
      id: string;
      projectId: string;
      createdBy: string;
      name: string;
      description: string | null;
      status: string;
      version: number;
      isPublic: boolean;
      createdAt: string;
      updatedAt: string;
    }>(`/workflows/${workflowId}`, { method: "PUT", body: JSON.stringify(data) }, true),

  deleteWorkflow: (workflowId: string) =>
    request<void>(`/workflows/${workflowId}`, { method: "DELETE" }, true),

  getProjectWorkflows: (projectId: string) =>
    request<Array<{
      id: string;
      projectId: string;
      createdBy: string;
      name: string;
      description: string | null;
      status: string;
      version: number;
      isPublic: boolean;
      createdAt: string;
      updatedAt: string;
    }>>(`/projects/${projectId}/workflows`, { method: "GET" }, true),

  getWorkflowGraph: (workflowId: string) =>
    request<{
      nodes: Array<{
        id: string;
        workflowId: string;
        nodeTypeId: string | null;
        typeCode: string;
        name: string | null;
        label: string | null;
        posX: number;
        posY: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
        configJson: any;
        credentialsId: string | null;
        notes: string | null;
        isDisabled: boolean;
        createdAt: string;
        updatedAt: string;
      }>;
      edges: Array<{
        id: string;
        workflowId: string;
        sourceNodeId: string;
        targetNodeId: string;
        sourceHandle: string | null;
        targetHandle: string | null;
        conditionType: string | null;
        label: string | null;
        createdAt: string;
      }>;
    }>(`/workflows/${workflowId}/graph`, { method: "GET" }, true),

  createNode: (workflowId: string, data: {
    type: string;
    name?: string;
    label?: string;
    posX: number;
   
    posY: number;
    configJson?: any;
  }) =>
    request<{
      id: string;
      workflowId: string;
      typeCode: string;
      name: string | null;
      label: string | null;
   
      posX: number;
      posY: number;
      configJson: any;
      createdAt: string;
      updatedAt: string;
    }>(`/workflows/${workflowId}/nodes`, { method: "POST", body: JSON.stringify(data) }, true),

  updateNode: (workflowId: string, nodeId: string, data: {
    name?: string;
   
    label?: string;
    posX?: number;
    posY?: number;
    configJson?: any;
    isDisabled?: boolean;
  }) =>
    request<{
      id: string;
      workflowId: string;
      typeCode: string;
   
      name: string | null;
      label: string | null;
      posX: number;
      posY: number;
      configJson: any;
      isDisabled: boolean;
      updatedAt: string;
    }>(`/workflows/${workflowId}/nodes/${nodeId}`, { method: "PUT", body: JSON.stringify(data) }, true),

  deleteNode: (workflowId: string, nodeId: string) =>
    request<void>(`/workflows/${workflowId}/nodes/${nodeId}`, { method: "DELETE" }, true),

  createEdge: (workflowId: string, data: {
    sourceNodeId: string;
    targetNodeId: string;
    sourceHandle?: string;
    targetHandle?: string;
    label?: string;
  }) =>
    request<{
      id: string;
      workflowId: string;
      sourceNodeId: string;
      targetNodeId: string;
      sourceHandle: string | null;
      targetHandle: string | null;
      label: string | null;
      createdAt: string;
    }>(`/workflows/${workflowId}/edges`, { method: "POST", body: JSON.stringify(data) }, true),

  deleteEdge: (workflowId: string, edgeId: string) =>
    request<void>(`/workflows/${workflowId}/edges/${edgeId}`, { method: "DELETE" }, true),

  executeManual: (workflowId: string, inputDataJson?: Record<string, unknown>) =>
    request<{
      id: string;
      workflowId: string;
   
      startedByUserId: string;
   
      triggerType: string;
      status: string;
      startedAt: string;
      finishedAt: string | null;
      inputDataJson: any;
      outputDataJson: {
        nodeOutputs: Record<string, any[]>;
        executedSteps: number;
      };
      errorMessage: string | null;
    }>(`/workflows/${workflowId}/executions/manual`, { 
      method: "POST", 
      body: JSON.stringify({ inputDataJson: inputDataJson || {} }) 
    }, true),

  getExecutions: (workflowId: string, params?: { limit?: number; offset?: number }) =>
    request<Array<{
   
      id: string;
   
      workflowId: string;
      startedByUserId: string;
      triggerType: string;
      status: string;
      startedAt: string;
      finishedAt: string | null;
      inputDataJson: any;
      outputDataJson: any;
      errorMessage: string | null;
    }>>(`/workflows/${workflowId}/executions?limit=${params?.limit || 50}&offset=${params?.offset || 0}`, { method: "GET" }, true),

   
  getExecution: (workflowId: string, executionId: string) =>
   
    request<{
      id: string;
      workflowId: string;
      startedByUserId: string;
      triggerType: string;
      status: string;
      startedAt: string;
      finishedAt: string | null;
      inputDataJson: any;
      outputDataJson: any;
   
      errorMessage: string | null;
   
    }>(`/workflows/${workflowId}/executions/${executionId}`, { method: "GET" }, true),

  getExecutionLogs: (workflowId: string, executionId: string, params?: { limit?: number; offset?: number }) =>
    request<Array<{
      id: string;
      executionId: string;
      nodeId: string;
      status: string;
      startedAt: string;
      finishedAt: string | null;
      inputDataJson: any;
      outputDataJson: any;
      errorMessage: string | null;
    }>>(`/workflows/${workflowId}/executions/${executionId}/logs?limit=${params?.limit || 100}&offset=${params?.offset || 0}`, { method: "GET" }, true),
};
