import { NextRequest, NextResponse } from "next/server";
import Uniform from "@/lib/uniform";

export async function POST(req: NextRequest) {
  try {
    const { projectId, apiKey } = await req.json();

    if (!projectId || !apiKey) {
      return NextResponse.json(
        { error: "Missing projectId or apiKey" },
        { status: 400 }
      );
    }

    const client = Uniform().getCanvasClient({ projectId, apiKey });
    
    const { componentDefinitions } = await client.getComponentDefinitions({
      limit: 10000,
    });

    const components = componentDefinitions.map((component) => ({
      id: component.id,
      name: component.name,
      parameters: component.parameters?.length,
      lastUpdated: component.updated,
    }));

    return NextResponse.json(components);
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
