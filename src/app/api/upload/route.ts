import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request): Promise<NextResponse> {
  const contentType = request.headers.get('content-type') || '';

  // 1. Direct Client Upload Token Generation (bypasses the 4.5MB Vercel Serverless Function limit, supporting up to 500MB)
  if (contentType.includes('application/json')) {
    try {
      const body = (await request.json()) as HandleUploadBody;

      const jsonResponse = await handleUpload({
        body,
        request,
        onBeforeGenerateToken: async (pathname) => {
          return {
            allowedContentTypes: [
              'image/jpeg',
              'image/png',
              'image/webp',
              'image/gif',
              'image/avif',
            ],
            tokenPayload: JSON.stringify({ pathname }),
          };
        },
        onUploadCompleted: async () => {
          // Upload completed callback
        },
      });

      return NextResponse.json(jsonResponse);
    } catch (error: any) {
      console.error('Handle client upload error:', error);
      return NextResponse.json(
        { error: error?.message || 'Failed to handle client upload' },
        { status: 400 }
      );
    }
  }

  // 2. Standard Multipart Form-Data Upload (for local dev or fallback)
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Direct server-side upload if Vercel Blob is configured
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import('@vercel/blob');
      const timestamp = Date.now();
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const blob = await put(`photos/${timestamp}-${cleanName}`, file, {
        access: 'public',
      });
      return NextResponse.json({
        success: true,
        url: blob.url,
        filename: file.name,
      });
    }

    // If running in production (Vercel) without Blob storage connected
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

    // Local development fallback: save to public/uploads
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

