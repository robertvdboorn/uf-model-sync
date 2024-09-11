import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const CONFIG_FILE_PATH = path.join(process.cwd(), 'config', 'projects.json');

export async function GET() {
  try {
    const data = await fs.readFile(CONFIG_FILE_PATH, 'utf8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // File doesn't exist, return an empty array
      return NextResponse.json([]);
    } else {
      return NextResponse.json({ message: 'Error reading projects file' }, { status: 500 });
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const projects = await request.json();
    await fs.writeFile(CONFIG_FILE_PATH, JSON.stringify(projects, null, 2));
    return NextResponse.json({ message: 'Projects saved successfully' });
  } catch (error) {
    return NextResponse.json({ message: 'Error writing to projects file' }, { status: 500 });
  }
}