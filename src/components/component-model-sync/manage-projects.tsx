import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { Project, GroupedProjects } from './types';
import { validateProject } from './utils';

type ManageProjectsProps = {
  groupedProjects: GroupedProjects;
  onAddProject: (project: Project) => Promise<void>;
  onDeleteProject: (projectId: string) => Promise<void>;
  onUpdateProject: (project: Project) => Promise<void>;
};

export function ManageProjects({
  groupedProjects,
  onAddProject,
  onDeleteProject,
  onUpdateProject,
}: ManageProjectsProps) {
  const [isManageProjectsModalOpen, setIsManageProjectsModalOpen] = useState(false);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [newProject, setNewProject] = useState<Project>({
    id: "",
    name: "",
    apiKey: "",
    teamId: "",
    teamName: "",
  });
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    id?: string;
    apiKey?: string;
  }>({});

  const handleAddProject = async () => {
    const errors = validateProject(newProject);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      await onAddProject(newProject);
      setNewProject({ id: "", name: "", apiKey: "", teamId: "", teamName: "" });
      setIsAddProjectModalOpen(false);
      setValidationErrors({});
    } catch (error) {
      console.error("Failed to add project:", error);
    }
  };

  const handleUpdateProject = async () => {
    if (editingProject) {
      const errors = validateProject(editingProject);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }

      try {
        await onUpdateProject(editingProject);
        setEditingProject(null);
        setIsEditProjectModalOpen(false);
        setValidationErrors({});
      } catch (error) {
        console.error("Failed to update project:", error);
      }
    }
  };

  return (
    <>
      <Dialog
        open={isManageProjectsModalOpen}
        onOpenChange={setIsManageProjectsModalOpen}
      >
        <DialogTrigger asChild>
          <Button>Manage Projects</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Manage Projects</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {Object.entries(groupedProjects).map(([teamName, teamProjects]) => (
              <div key={teamName} className="space-y-2">
                <h3 className="font-semibold">{teamName}</h3>
                {teamProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between"
                  >
                    <span className="truncate max-w-[200px]">
                      {project.name}
                    </span>
                    <div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingProject(project);
                          setIsEditProjectModalOpen(true);
                        }}
                        className="mr-2"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteProject(project.id)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <Button
            onClick={() => setIsAddProjectModalOpen(true)}
            className="w-full"
          >
            <PlusIcon className="mr-2 h-4 w-4" /> Add New Project
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isAddProjectModalOpen}
        onOpenChange={setIsAddProjectModalOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newProjectId">Project ID (UUID)</Label>
              <Input
                id="newProjectId"
                value={newProject.id}
                onChange={(e) =>
                  setNewProject({ ...newProject, id: e.target.value })
                }
                className="font-mono text-sm"
              />
              {validationErrors.id && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                  {validationErrors.id}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="newApiKey">API Key</Label>
              <Textarea
                id="newApiKey"
                value={newProject.apiKey}
                onChange={(e) =>
                  setNewProject({ ...newProject, apiKey: e.target.value })
                }
                className="font-mono text-sm"
                rows={3}
              />
              {validationErrors.apiKey && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                  {validationErrors.apiKey}
                </p>
              )}
            </div>
            <Button
              onClick={handleAddProject}
              className="w-full"
            >
              Add Project
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditProjectModalOpen}
        onOpenChange={setIsEditProjectModalOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          {editingProject && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editProjectId">Project ID</Label>
                <Input
                  id="editProjectId"
                  value={editingProject.id}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      id: e.target.value,
                    })
                  }
                  className="font-mono text-sm"
                />
                {validationErrors.id && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                    {validationErrors.id}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="editProjectName">Project Name</Label>
                <Input
                  id="editProjectName"
                  value={editingProject.name}
                  disabled
                  className="bg-gray-100 dark:bg-gray-800"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Project name is retrieved from the API and cannot be edited
                  directly.
                </p>
              </div>
              <div>
                <Label htmlFor="editApiKey">API Key</Label>
                <Textarea
                  id="editApiKey"
                  value={editingProject.apiKey}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      apiKey: e.target.value,
                    })
                  }
                  className="font-mono text-sm"
                  rows={3}
                />
                {validationErrors.apiKey && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                    {validationErrors.apiKey}
                  </p>
                )}
              </div>
              <Button onClick={handleUpdateProject} className="w-full">
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}