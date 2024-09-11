import { useState, useEffect } from 'react';
import { Project, Component, GroupedProjects } from './types';
import { groupProjectsByTeam, fetchProjectData } from './utils';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [groupedProjects, setGroupedProjects] = useState<GroupedProjects>({});

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      saveProjects(projects);
      setGroupedProjects(groupProjectsByTeam(projects));
    }
  }, [projects]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/config/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      setProjects(data);
      setGroupedProjects(groupProjectsByTeam(data));
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const saveProjects = async (projectsToSave: Project[]) => {
    try {
      const response = await fetch('/api/config/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectsToSave),
      });
      if (!response.ok) {
        throw new Error('Failed to save projects');
      }
    } catch (error) {
      console.error('Error saving projects:', error);
    }
  };

  const addProject = async (newProject: Project) => {
    try {
      const { name, teamId, teamName } = await fetchProjectData(
        newProject.id,
        newProject.apiKey
      );
      const projectToAdd = { ...newProject, name, teamId, teamName };
      const updatedProjects = [...projects, projectToAdd];
      setProjects(updatedProjects);
      await saveProjects(updatedProjects);
    } catch (error) {
      console.error("Failed to add project:", error);
      throw error;
    }
  };

  const deleteProject = async (projectId: string) => {
    const updatedProjects = projects.filter(
      (project) => project.id !== projectId
    );
    setProjects(updatedProjects);
    await saveProjects(updatedProjects);
  };

  const updateProject = async (updatedProject: Project) => {
    try {
      const { name, teamId, teamName } = await fetchProjectData(
        updatedProject.id,
        updatedProject.apiKey
      );
      const finalUpdatedProject = { ...updatedProject, name, teamId, teamName };
      const updatedProjects = projects.map((p) =>
        p.id === finalUpdatedProject.id ? finalUpdatedProject : p
      );
      setProjects(updatedProjects);
      await saveProjects(updatedProjects);
    } catch (error) {
      console.error("Failed to update project:", error);
      throw error;
    }
  };

  return { projects, groupedProjects, addProject, deleteProject, updateProject };
};

export const useComponents = () => {
  const fetchProjectComponents = async (projectId: string, apiKey: string): Promise<Component[]> => {
    try {
      const response = await fetch("/api/uniform/components", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectId, apiKey }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch project components");
      }

      const components = await response.json();
      return components.map((component: Component) => ({
        id: component.id,
        name: component.name,
        parameters: component.parameters,
        lastUpdated: component.lastUpdated,
      }));
    } catch (error) {
      console.error("Error fetching project components:", error);
      return [];
    }
  };

  const syncComponentToProject = async (
    sourceProject: Project,
    destinationProject: Project,
    componentId: string
  ) => {
    try {
      const response = await fetch("/api/uniform/components/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: {
            projectId: sourceProject.id,
            apiKey: sourceProject.apiKey,
          },
          destination: {
            projectId: destinationProject.id,
            apiKey: destinationProject.apiKey,
          },
          componentId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to sync component");
      }

      const result = await response.json();

      if (result.message !== "Success") {
        throw new Error(result.error || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Error syncing component:", error);
      throw error;
    }
  };

  return { fetchProjectComponents, syncComponentToProject };
};