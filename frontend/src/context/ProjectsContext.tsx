import React, { createContext, useContext, useEffect, useState } from "react";
import { getAccessToken, projectApi } from "../services/api";

export interface ProjectMember {
  role: string;
}

export interface Project {
  id: string;
  ownerId: string;
  name: string;
  description: string;
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
  refreshProjects: () => Promise<Project[]>;
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

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        isLoading,
        personalProject,
        personalProjectId: personalProject?.id || null,
        refreshProjects,
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
