export type Component = {
    id: string;
    name: string;
    parameters: number;
    lastUpdated: string;
  };
  
  export type Project = {
    id: string;
    name: string;
    apiKey: string;
    teamId: string;
    teamName: string;
  };
  
  export type GroupedProjects = {
    [teamName: string]: Project[];
  };