import React from 'react';
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Project, GroupedProjects } from './types';

type ProjectSelectionProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  groupedProjects: GroupedProjects;
  disabledProject?: string;
  projects: Project[];
};

export function ProjectSelection({
  label,
  value,
  onChange,
  groupedProjects,
  disabledProject,
  projects,
}: ProjectSelectionProps) {
  return (
    <div className="flex-1">
      <Label htmlFor={label}>{label}</Label>
      <Select
        onValueChange={onChange}
        value={value}
        disabled={projects.length === 0}
      >
        <SelectTrigger id={label}>
          <SelectValue
            placeholder={
              projects.length === 0
                ? "No projects available"
                : `Select ${label}`
            }
          />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(groupedProjects).map(([teamName, teamProjects]) => (
            <SelectGroup key={teamName}>
              <SelectLabel>{teamName}</SelectLabel>
              {teamProjects.map((project) => (
                <SelectItem
                  key={project.id}
                  value={project.id}
                  disabled={project.id === disabledProject}
                >
                  {project.name}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}