import { Project } from './types';

export const fetchProjectData = async (
  projectId: string,
  apiKey: string
): Promise<{ name: string; teamId: string; teamName: string }> => {
  try {
    const response = await fetch("/api/uniform/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ projectId, apiKey }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch project data from the proxy");
    }

    const projectData = await response.json();
    return {
      name: projectData.projectName,
      teamId: projectData.teamId,
      teamName: projectData.teamName,
    };
  } catch (error) {
    console.error("Error fetching project data:", error);
    throw error;
  }
};

export const isValidUUID = (uuid: string) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const validateProject = (project: Project) => {
  const errors: { id?: string; apiKey?: string } = {};
  if (!isValidUUID(project.id)) {
    errors.id = "Invalid UUID format";
  }
  if (project.apiKey.length < 50 || project.apiKey.length > 150) {
    errors.apiKey = "API key must be between 50 and 150 characters";
  }
  return errors;
};

export const groupProjectsByTeam = (projects: Project[]) => {
  return projects.reduce((acc, project) => {
    if (!acc[project.teamName]) {
      acc[project.teamName] = [];
    }
    acc[project.teamName].push(project);
    return acc;
  }, {} as { [teamName: string]: Project[] });
};