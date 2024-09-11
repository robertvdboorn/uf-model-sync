import { CanvasClient } from "@uniformdev/canvas";

// Define the ProjectData type (as mentioned above)
interface ProjectData {
  id: string;
  createdAt: string;
  name: string;
  teamId: string;
  teamName: string;
  projectTypeId: string;
  previewUrl: string;
  uiVersion: number;
  sampleSize: number;
  searchIndexVersion: string;
  searchIndexStatus: string;
  relationshipsIndexStatus: string;
}

// ProjectClient class that includes the getProject method
class ProjectClient {
  private projectId: string;
  private apiKey: string;

  constructor({ projectId, apiKey }: { projectId: string; apiKey: string }) {
    this.projectId = projectId;
    this.apiKey = apiKey;
  }

  // Method to fetch project data
  async getProject(): Promise<ProjectData> {
    try {
      const response = await fetch(`https://uniform.app/api/v1/project?projectId=${this.projectId}`, {
        headers: {
          "x-api-key": this.apiKey,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch project data: ${response.statusText}`);
      }

      const projectData: ProjectData = await response.json();
      return projectData;
    } catch (error) {
      console.error("Error fetching project data:", error);
      throw error;
    }
  }
}

// The Uniform factory function now includes both CanvasClient and ProjectClient
const Uniform = () => {
  return {
    getCanvasClient: ({
      projectId,
      apiKey,
    }: {
      projectId: string;
      apiKey: string;
    }) => {
      return new CanvasClient({
        projectId,
        apiKey,
      });
    },
    getProjectClient: ({
      projectId,
      apiKey,
    }: {
      projectId: string;
      apiKey: string;
    }) => {
      return new ProjectClient({ projectId, apiKey });
    },
  };
};

export default Uniform;
