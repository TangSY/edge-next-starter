import { NextRequest, NextResponse } from 'next/server';
import {
  validationErrorResponse,
  serviceUnavailableResponse,
  notFoundResponse,
  withMiddleware,
  withApiHandler,
} from '@/lib/api';
import { uploadFile, downloadFile } from '@/lib/r2/client';

export const runtime = 'edge';

// Max file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// POST /api/upload - Upload file to R2
export async function POST(request: NextRequest) {
  return withMiddleware(request, () =>
    withApiHandler(async () => {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return validationErrorResponse('No file provided');
      }

      if (file.size > MAX_FILE_SIZE) {
        return validationErrorResponse(
          `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`
        );
      }

      const timestamp = Date.now();
      const filename = `${timestamp}-${file.name}`;
      const key = `uploads/${filename}`;

      const stored = await uploadFile(key, file, {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      });

      if (!stored) {
        return serviceUnavailableResponse('R2 storage not available');
      }

      return {
        key: stored.key,
        size: stored.size,
        etag: stored.etag,
        uploaded: stored.uploaded,
        url: `/api/upload?key=${encodeURIComponent(stored.key)}`,
      };
    })
  );
}

// GET /api/upload?key=xxx - Download file
export async function GET(request: NextRequest) {
  return withMiddleware(request, async () => {
    const key = request.nextUrl.searchParams.get('key');

    if (!key) {
      return validationErrorResponse('File key is required');
    }

    const fileBlob = await downloadFile(key);
    if (!fileBlob) {
      return notFoundResponse(`File not found: ${key}`);
    }

    return new NextResponse(await fileBlob.arrayBuffer(), {
      headers: {
        'Content-Type': fileBlob.type || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  });
}
