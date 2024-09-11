import { NextRequest, NextResponse } from 'next/server';
import Uniform from '@/lib/uniform';

export async function POST(req: NextRequest) {
  try {
    const { projectId, apiKey } = await req.json();

    if (!projectId || !apiKey) {
      return NextResponse.json(
        { error: 'Missing projectId or apiKey' },
        { status: 400 }
      );
    }

    const client = Uniform().getProjectClient({ projectId, apiKey });
    const projectData = await client.getProject();

    return NextResponse.json({ projectId: projectId, projectName: projectData.name, teamId: projectData.teamId, teamName: projectData.teamName });
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal Server Error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
