import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'photos.json');

function getPhotosData() {
  try {
    if (fs.existsSync(dataFilePath)) {
      const fileData = fs.readFileSync(dataFilePath, 'utf8');
      return JSON.parse(fileData);
    }
  } catch (err) {
    console.error('Error reading photos.json:', err);
  }
  return { worksData: [], portfolioImages: [] };
}

export async function GET() {
  const data = getPhotosData();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const currentData = getPhotosData();

    const updatedData = {
      worksData: Array.isArray(body.worksData) ? body.worksData : currentData.worksData,
      portfolioImages: Array.isArray(body.portfolioImages) ? body.portfolioImages : currentData.portfolioImages,
    };

    const dir = path.dirname(dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(dataFilePath, JSON.stringify(updatedData, null, 2), 'utf8');

    return NextResponse.json({
      success: true,
      message: 'Photos updated successfully',
      data: updatedData,
    });
  } catch (error) {
    console.error('Error saving photos:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update photos' },
      { status: 500 }
    );
  }
}
