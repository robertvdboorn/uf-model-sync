"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCwIcon, SearchIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProjectSelection } from "./component-model-sync/project-selection";
import { ManageProjects } from "./component-model-sync/manage-projects";
import { ComponentTable } from "./component-model-sync/component-table";
import { useProjects, useComponents } from "./component-model-sync/hooks";
import { Component } from "./component-model-sync/types";

export function ComponentModelSync() {
  const { toast } = useToast();
  const { projects, groupedProjects, addProject, deleteProject, updateProject } = useProjects();
  const { fetchProjectComponents, syncComponentToProject } = useComponents();

  const [projectAComponents, setProjectAComponents] = useState<Component[]>([]);
  const [projectBComponents, setProjectBComponents] = useState<Component[]>([]);
  const [selectedProjectA, setSelectedProjectA] = useState<string>("");
  const [selectedProjectB, setSelectedProjectB] = useState<string>("");
  const [isRefreshingProjects, setIsRefreshingProjects] = useState(false);
  const [isRefreshingComponents, setIsRefreshingComponents] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [syncingComponents, setSyncingComponents] = useState<Set<string>>(new Set());

  const handleProjectAChange = async (value: string) => {
    setSelectedProjectA(value);
    const project = projects.find(p => p.id === value);
    if (project) {
      const components = await fetchProjectComponents(project.id, project.apiKey);
      setProjectAComponents(components);
    }
    if (value === selectedProjectB) {
      setSelectedProjectB("");
      setProjectBComponents([]);
    }
  };

  const handleProjectBChange = async (value: string) => {
    setSelectedProjectB(value);
    const project = projects.find(p => p.id === value);
    if (project) {
      const components = await fetchProjectComponents(project.id, project.apiKey);
      setProjectBComponents(components);
    }
    if (value === selectedProjectA) {
      setSelectedProjectA("");
      setProjectAComponents([]);
    }
  };

  const refreshProjectNames = async () => {
    setIsRefreshingProjects(true);
    try {
      await Promise.all(projects.map(updateProject));
      toast({
        title: "Success",
        description: "Project names refreshed successfully.",
      });
    } catch (error) {
      console.error("Failed to refresh project names:", error);
      toast({
        title: "Error",
        description: "Failed to refresh project names. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshingProjects(false);
    }
  };

  const refreshComponents = async () => {
    setIsRefreshingComponents(true);
    try {
      const projectA = projects.find(p => p.id === selectedProjectA);
      const projectB = projects.find(p => p.id === selectedProjectB);

      if (projectA) {
        const componentsA = await fetchProjectComponents(projectA.id, projectA.apiKey);
        setProjectAComponents(componentsA);
      }

      if (projectB) {
        const componentsB = await fetchProjectComponents(projectB.id, projectB.apiKey);
        setProjectBComponents(componentsB);
      }

      toast({
        title: "Success",
        description: "Components refreshed successfully.",
      });
    } catch (error) {
      console.error("Error refreshing components:", error);
      toast({
        title: "Error",
        description: "Failed to refresh components. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshingComponents(false);
    }
  };

  const handleSyncComponent = async (fromProject: "A" | "B", componentId: string) => {
    const sourceProject = fromProject === "A" ? projects.find(p => p.id === selectedProjectA) : projects.find(p => p.id === selectedProjectB);
    const destinationProject = fromProject === "A" ? projects.find(p => p.id === selectedProjectB) : projects.find(p => p.id === selectedProjectA);

    if (!sourceProject || !destinationProject) {
      toast({
        title: "Error",
        description: "Source or destination project not found.",
        variant: "destructive",
      });
      return;
    }

    setSyncingComponents(prev => new Set(prev).add(componentId));

    try {
      await syncComponentToProject(sourceProject, destinationProject, componentId);
      toast({
        title: "Success",
        description: "Component synced successfully.",
      });

      // Update the component in the destination project
      const sourceComponents = fromProject === "A" ? projectAComponents : projectBComponents;
      const componentToSync = sourceComponents.find(comp => comp.id === componentId);

      if (componentToSync) {
        if (fromProject === "A") {
          setProjectBComponents(prev => [...prev.filter(comp => comp.id !== componentId), componentToSync]);
        } else {
          setProjectAComponents(prev => [...prev.filter(comp => comp.id !== componentId), componentToSync]);
        }
      }
    } catch (error) {
      console.error("Error syncing component:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to sync component. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSyncingComponents(prev => {
        const newSet = new Set(prev);
        newSet.delete(componentId);
        return newSet;
      });
    }
  };

  const allComponents = [...projectAComponents, ...projectBComponents];
  const uniqueComponentIds = Array.from(
    new Set(allComponents.map((comp) => comp.id))
  );

  const filteredComponents = uniqueComponentIds.filter((componentId) =>
    componentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedComponents = filteredComponents.sort((a, b) => a.localeCompare(b));

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 space-y-4">
        <div className="flex space-x-4">
          <ProjectSelection
            label="Project A"
            value={selectedProjectA}
            onChange={handleProjectAChange}
            groupedProjects={groupedProjects}
            disabledProject={selectedProjectB}
            projects={projects}
          />
          <ProjectSelection
            label="Project B"
            value={selectedProjectB}
            onChange={handleProjectBChange}
            groupedProjects={groupedProjects}
            disabledProject={selectedProjectA}
            projects={projects}
          />
        </div>

        <div className="flex justify-between items-center">
          <ManageProjects
            groupedProjects={groupedProjects}
            onAddProject={addProject}
            onDeleteProject={deleteProject}
            onUpdateProject={updateProject}
          />
          <div className="flex space-x-2">
            <Button 
              onClick={refreshProjectNames} 
              disabled={isRefreshingProjects}
              className="h-10"
            >
              <RefreshCwIcon className={`mr-2 h-4 w-4 ${isRefreshingProjects ? 'animate-spin' : ''}`} />
              {isRefreshingProjects ? "Refreshing..." : "Refresh Project Names"}
            </Button>
            <Button 
              onClick={refreshComponents} 
              disabled={isRefreshingComponents || (!selectedProjectA && !selectedProjectB)}
              className="h-10"
            >
              <RefreshCwIcon className={`mr-2 h-4 w-4 ${isRefreshingComponents ? 'animate-spin' : ''}`} />
              {isRefreshingComponents ? "Refreshing..." : "Refresh Components"}
            </Button>
          </div>
        </div>

        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search component IDs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full"
          />
        </div>
      </div>

      <ComponentTable
        components={sortedComponents}
        projectAComponents={projectAComponents}
        projectBComponents={projectBComponents}
        selectedProjectA={projects.find(p => p.id === selectedProjectA)}
        selectedProjectB={projects.find(p => p.id === selectedProjectB)}
        onSyncComponent={handleSyncComponent}
        syncingComponents={syncingComponents}
      />
    </div>
  );
}