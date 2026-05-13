import React, { createContext, useContext, useState } from "react";
import { workflowApi } from "../services/api";

export interface Workflow {
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
}

interface WorkflowsContextType {
  workflows: Workflow[];
  isLoading: boolean;
  createWorkflow: (
    projectId: string,
    data: {
      name: string;
      description?: string;
      status?: string;
      isPublic?: boolean;
    }
  ) => Promise<Workflow>;
  getWorkflow: (workflowId: string) => Promise<Workflow>;
  updateWorkflow: (
    workflowId: string,
    data: {
      name?: string;
      description?: string;
      status?: string;
      isPublic?: boolean;
    }
  ) => Promise<Workflow>;
  deleteWorkflow: (workflowId: string) => Promise<void>;
  getProjectWorkflows: (projectId: string) => Promise<Workflow[]>;
  clearWorkflows: () => void;
}

const WorkflowsContext = createContext<WorkflowsContextType | undefined>(
  undefined
);

export function WorkflowsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const clearWorkflows = () => {
    setWorkflows([]);
    setIsLoading(false);
  };

  const createWorkflow = async (
    projectId: string,
    data: {
      name: string;
      description?: string;
      status?: string;
      isPublic?: boolean;
    }
  ): Promise<Workflow> => {
    const newWorkflow = await workflowApi.createWorkflow(projectId, data);
    setWorkflows((prev) => [...prev, newWorkflow]);
    return newWorkflow;
  };

  const getWorkflow = async (workflowId: string): Promise<Workflow> => {
    const workflow = await workflowApi.getWorkflow(workflowId);
    return workflow;
  };

  const updateWorkflow = async (
    workflowId: string,
    data: {
      name?: string;
      description?: string;
      status?: string;
      isPublic?: boolean;
    }
  ): Promise<Workflow> => {
    const updatedWorkflow = await workflowApi.updateWorkflow(workflowId, data);
    setWorkflows((prev) =>
      prev.map((w) => (w.id === workflowId ? updatedWorkflow : w))
    );
    return updatedWorkflow;
  };

  const deleteWorkflow = async (workflowId: string): Promise<void> => {
    await workflowApi.deleteWorkflow(workflowId);
    setWorkflows((prev) => prev.filter((w) => w.id !== workflowId));
  };

  const getProjectWorkflows = async (
    projectId: string
  ): Promise<Workflow[]> => {
    setIsLoading(true);
    try {
      const loadedWorkflows = await workflowApi.getProjectWorkflows(projectId);
      setWorkflows(loadedWorkflows);
      return loadedWorkflows;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WorkflowsContext.Provider
      value={{
        workflows,
        isLoading,
        createWorkflow,
        getWorkflow,
        updateWorkflow,
        deleteWorkflow,
        getProjectWorkflows,
        clearWorkflows,
      }}
    >
      {children}
    </WorkflowsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWorkflows() {
  const context = useContext(WorkflowsContext);

  if (!context) {
    throw new Error("useWorkflows must be used within WorkflowsProvider");
  }

  return context;
}
