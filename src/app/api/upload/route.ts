import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // 1. If Vercel Blob storage is configured, upload directly to cloud CDN
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { put } = await import('@vercel/blob');
        const timestamp = Date.now();
        const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `photos/${timestamp}-${cleanName}`;

        const blob = await put(filename, file, {
          access: 'public',
        });

        return NextResponse.json({
          success: true,
          url: blob.url,
          filename: file.name,
        });
      } catch (blobErr: any) {
        console.error('Vercel Blob upload failed:', blobErr);
        return NextResponse.json(
          {
            success: false,
            error: blobErr?.message || 'Failed to upload photo to cloud storage',
          },
          { status: 500 }
        );
      }
    }

    // 2. If running in production (Vercel) without Blob storage connected
    if (process.env.VERCEL) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Cloud storage not connected. In your Vercel Dashboard, go to Storage -> Create Blob to enable free photo uploads.',
        },
        { status: 500 }
      );
    }

    // 3. Local development fallback: save to public/uploads
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const cleanOriginalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}-${cleanOriginalName}`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: filename,
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to process file upload' },
      { status: 500 }
    );
  }
}

