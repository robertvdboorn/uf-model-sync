import { NextRequest, NextResponse } from "next/server";
import Uniform from "@/lib/uniform";
import fs from "fs/promises";
import path from "path";

const createBackupFilePath = (componentId: string, projectId: string) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // Format timestamp safely for file name
  return path.join(process.cwd(), 'backup', `${componentId}_${projectId}_${timestamp}.json`);
};

export async function POST(req: NextRequest) {
  try {
    const {
      source: { projectId: sourceProjectId, apiKey: sourceApiKey },
      destination: { projectId: destinationProjectId, apiKey: destinationApiKey },
      componentId,
    } = await req.json();

    const sourceClient = Uniform().getCanvasClient({
      projectId: sourceProjectId,
      apiKey: sourceApiKey,
    });

    const destinationClient = Uniform().getCanvasClient({
      projectId: destinationProjectId,
      apiKey: destinationApiKey,
    });

    const destinationComponent = await destinationClient.getComponentDefinitions({ componentId });

    if (destinationComponent && destinationComponent.componentDefinitions.length > 0) {
      const { componentDefinitions } = destinationComponent;

      const backupFilePath = createBackupFilePath(componentId, destinationProjectId);
      await fs.mkdir(path.dirname(backupFilePath), { recursive: true }); // Ensure /backup folder exists
      await fs.writeFile(backupFilePath, JSON.stringify(componentDefinitions[0], null, 2));

      console.log(`Backup saved: ${backupFilePath}`);
    }

    const sourceComponent = await sourceClient.getComponentDefinitions({ componentId });

    if (sourceComponent === null || sourceComponent.componentDefinitions.length === 0) {
      return NextResponse.json(
        { error: "Component not found in source project" },
        { status: 400 }
      );
    }

    const { componentDefinitions: sourceComponentDefinitions } = sourceComponent;

    await destinationClient.updateComponentDefinition({
      componentDefinition: sourceComponentDefinitions[0],
    });

    return NextResponse.json({ message: "Success" });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Internal Server Error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
