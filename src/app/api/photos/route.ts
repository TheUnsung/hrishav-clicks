import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'photos.json');

function getLocalPhotosData() {
  try {
    if (fs.existsSync(dataFilePath)) {
      const fileData = fs.readFileSync(dataFilePath, 'utf8');
      return JSON.parse(fileData);
    }
  } catch (err) {
    console.error('Error reading local photos.json:', err);
  }
  return { worksData: [], portfolioImages: [] };
}

export async function GET() {
  // 1. If Vercel Blob is configured, read the cloud version
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { list } = await import('@vercel/blob');
      const { blobs } = await list({ prefix: 'data/photos.json' });
      const photosBlob = blobs.find((b) => b.pathname === 'data/photos.json');

      if (photosBlob) {
        const res = await fetch(photosBlob.url, { cache: 'no-store' });
        if (res.ok) {
          const cloudData = await res.json();
          return NextResponse.json({
            ...cloudData,
            cloudStorage: true,
          });
        }
      }
    } catch (err) {
      console.error('Error reading photos from Vercel Blob, falling back to local file:', err);
    }
  }

  // 2. Fallback to local photos.json (or bundled file on Vercel)
  const data = getLocalPhotosData();
  return NextResponse.json({
    ...data,
    cloudStorage: !!process.env.BLOB_READ_WRITE_TOKEN,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. If Vercel Blob is configured, persist to cloud
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { put } = await import('@vercel/blob');

        // Fetch current data from blob or fallback
        let currentWorks: any[] = [];
        let currentPort: any[] = [];

        try {
          const { list } = await import('@vercel/blob');
          const { blobs } = await list({ prefix: 'data/photos.json' });
          const photosBlob = blobs.find((b) => b.pathname === 'data/photos.json');
          if (photosBlob) {
            const res = await fetch(photosBlob.url, { cache: 'no-store' });
            if (res.ok) {
              const currentData = await res.json();
              currentWorks = currentData.worksData || [];
              currentPort = currentData.portfolioImages || [];
            }
          }
        } catch {
          // ignore error fetching previous blob
        }

        if (currentWorks.length === 0 && currentPort.length === 0) {
          const local = getLocalPhotosData();
          currentWorks = local.worksData || [];
          currentPort = local.portfolioImages || [];
        }

        const updatedData = {
          worksData: Array.isArray(body.worksData) ? body.worksData : currentWorks,
          portfolioImages: Array.isArray(body.portfolioImages) ? body.portfolioImages : currentPort,
        };

        await put('data/photos.json', JSON.stringify(updatedData, null, 2), {
          access: 'public',
          addRandomSuffix: false,
          allowOverwrite: true,
        });

        return NextResponse.json({
          success: true,
          message: 'Photos updated successfully in cloud storage',
          data: updatedData,
        });
      } catch (blobErr: any) {
        console.error('Error saving to Vercel Blob:', blobErr);
        return NextResponse.json(
          {
            success: false,
            error: blobErr?.message || 'Failed to update photos in cloud storage',
          },
          { status: 500 }
        );
      }
    }

    // 2. If running on Vercel without Blob storage connected
    if (process.env.VERCEL) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Cloud storage not connected. In your Vercel Dashboard, go to Storage -> Create Blob to enable live saving.',
        },
        { status: 500 }
      );
    }

    // 3. Local development fallback: write to disk
    const currentData = getLocalPhotosData();
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
  } catch (error: any) {
    console.error('Error saving photos:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update photos' },
      { status: 500 }
    );
  }
}

