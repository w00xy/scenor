import React, { createContext, useContext, useEffect, useState } from "react";
import { getAccessToken, projectApi } from "../services/api";

export interface ProjectMember {
  role: string;
}

export interface Project {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  isArchived: boolean;
  type: string;
  createdAt: string;
  updatedAt: string;
  members: ProjectMember[];
  accessRole: string;
}

interface ProjectsContextType {
  projects: Project[];
  isLoading: boolean;
  personalProject: Project | null;
  personalProjectId: string | null;
  teamProjects: Project[];
  refreshProjects: () => Promise<Project[]>;
  createProject: (name: string, description: string) => Promise<Project>;
  updateProject: (projectId: string, data: { name?: string; description?: string }) => Promise<Project>;
  deleteProject: (projectId: string) => Promise<void>;
  clearProjects: () => void;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(
  undefined,
);

export function ProjectsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const clearProjects = () => {
    setProjects([]);
    setIsLoading(false);
  };

  const refreshProjects = async (): Promise<Project[]> => {
    if (!getAccessToken()) {
      clearProjects();
      return [];
    }

    setIsLoading(true);
    try {
      const loadedProjects = await projectApi.getProjects();
      setProjects(loadedProjects);
      return loadedProjects;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!getAccessToken()) {
      clearProjects();
      return;
    }

    void refreshProjects();
  }, []);

  const personalProject =
    projects.find((project) => project.type === "PERSONAL") || null;

  const teamProjects = projects.filter((project) => project.type === "TEAM");

  const createProject = async (name: string, description: string): Promise<Project> => {
    const newProject = await projectApi.createProject({ name, description });
    // Добавляем новый проект в state локально
    setProjects((prev) => [...prev, newProject]);
    return newProject;
  };

  const updateProject = async (projectId: string, data: { name?: string; description?: string }): Promise<Project> => {
    const updatedProject = await projectApi.updateProject(projectId, data);
    // Обновляем проект в state локально
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? updatedProject : p))
    );
    return updatedProject;
  };

  const deleteProject = async (projectId: string): Promise<void> => {
    await projectApi.deleteProject(projectId);
    // Удаляем проект из state локально
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
  };

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        isLoading,
        personalProject,
        personalProjectId: personalProject?.id || null,
        teamProjects,
        refreshProjects,
        createProject,
        updateProject,
        deleteProject,
        clearProjects,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectsContext);

  if (!context) {
    throw new Error("useProjects must be used within ProjectsProvider");
  }

  return context;
}
