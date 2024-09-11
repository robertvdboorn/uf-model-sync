import { NextRequest, NextResponse } from "next/server";
import Uniform from "@/lib/uniform";

export async function POST(req: NextRequest) {
  try {
    const {
      source: { projectId: sourceProjectId, apiKey: sourceApiKey },
      destination: {
        projectId: destinationProjectId,
        apiKey: destinationApiKey,
      },
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

    const component = await sourceClient.getComponentDefinitions({
      componentId,
    });

    if (component === null || component.componentDefinitions.length === 0) {
      return NextResponse.json(
        { error: "Component not found in source project" },
        { status: 400 }
      );
    }

    const { componentDefinitions } = component;

    await destinationClient.updateComponentDefinition({
      componentDefinition: componentDefinitions[0],
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
