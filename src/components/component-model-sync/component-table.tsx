import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  ClockIcon,
} from "lucide-react";
import { Component, Project } from './types';

type ComponentTableProps = {
  components: string[];
  projectAComponents: Component[];
  projectBComponents: Component[];
  selectedProjectA: Project | undefined;
  selectedProjectB: Project | undefined;
  onSyncComponent: (fromProject: "A" | "B", componentId: string) => Promise<void>;
  syncingComponents: Set<string>;
};

export function ComponentTable({
  components,
  projectAComponents,
  projectBComponents,
  selectedProjectA,
  selectedProjectB,
  onSyncComponent,
  syncingComponents,
}: ComponentTableProps) {
  const renderComponentCell = (
    component: Component | undefined,
    project: "A" | "B",
    isNewest: boolean,
    isOldest: boolean
  ) => {
    if (!component) {
      return (
        <div>
          <p className="text-gray-500 italic">Component not present</p>
        </div>
      );
    }

    const cellClasses = `p-4 rounded-lg 
    ${
      isNewest
        ? "bg-green-100 dark:bg-green-900 bg-opacity-50 dark:bg-opacity-35"
        : isOldest
        ? "bg-red-100 dark:bg-red-900 bg-opacity-50 dark:bg-opacity-35"
        : ""
    }
    `;

    return (
      <div className={cellClasses}>
        <h3 className="font-semibold flex items-center">
          {component.name}
          {isNewest && (
            <span className="ml-2 text-green-600 dark:text-green-400">
              <ClockIcon className="h-4 w-4" />
            </span>
          )}
          {isOldest && (
            <span className="ml-2 text-red-600 dark:text-red-400">
              <ClockIcon className="h-4 w-4" />
            </span>
          )}
        </h3>
        <p>Parameters: {component.parameters}</p>
        <p>Last Updated: {new Date(component.lastUpdated).toLocaleString()}</p>
        <Button
          onClick={() => onSyncComponent(project, component.id)}
          className="mt-2"
          disabled={syncingComponents.has(component.id)}
        >
          {syncingComponents.has(component.id) ? (
            "Syncing..."
          ) : project === "A" ? (
            <>
              Sync to B <ArrowRightIcon className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              <ArrowLeftIcon className="mr-2 h-4 w-4" /> Sync to A
            </>
          )}
        </Button>
      </div>
    );
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-1/3">Project A</TableHead>
          <TableHead className="w-1/3 text-center">Component ID</TableHead>
          <TableHead className="w-1/3">Project B</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
      {components.length > 0 ? (
          components.map((componentId) => {
            const componentA = projectAComponents.find((comp) => comp.id === componentId);
            const componentB = projectBComponents.find((comp) => comp.id === componentId);
            const isNewestA = componentA && (!componentB || new Date(componentA.lastUpdated) > new Date(componentB?.lastUpdated || 0));
            const isNewestB = componentB && (!componentA || new Date(componentB.lastUpdated) > new Date(componentA?.lastUpdated || 0));
            const isOldestA = componentA && componentB && new Date(componentA.lastUpdated) < new Date(componentB.lastUpdated);
            const isOldestB = componentB && componentA && new Date(componentB.lastUpdated) < new Date(componentA.lastUpdated);

            return (
              <TableRow key={componentId}>
                <TableCell>
                  {selectedProjectA ? (
                    renderComponentCell(componentA, "A", isNewestA || false, isOldestA || false)
                  ) : (
                    <div className="text-center p-4">
                      <p className="text-gray-500 dark:text-gray-400">
                        Please select a project for Project A
                      </p>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-center align-middle">
                  <span className="font-mono text-sm">{componentId}</span>
                </TableCell>
                <TableCell>
                  {selectedProjectB ? (
                    renderComponentCell(componentB, "B", isNewestB || false, isOldestB || false)
                  ) : (
                    <div className="text-center p-4">
                      <p className="text-gray-500 dark:text-gray-400">
                        Please select a project for Project B
                      </p>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            );
          })
        ) : (
          <TableRow>
            <TableCell colSpan={3} className="text-center py-4">
              <p className="text-gray-500 dark:text-gray-400">
                No components to display. Please select projects for
                comparison or adjust your search.
              </p>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}