/**
 * Upload Page
 * Simple UI to upload a file to R2 via /api/upload
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { UploadService, type UploadResult } from '@/services';
import { ApiError } from '@/lib/http';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload() {
    if (!file) {
      setError('Please choose a file');
      return;
    }
    setIsUploading(true);
    setError(null);
    setResult(null);

    try {
      const uploadResult = await UploadService.uploadFile(file);
      setResult(uploadResult);
    } catch (e: unknown) {
      if (e instanceof ApiError) {
        setError(e.message);
      } else {
        const message = e instanceof Error ? e.message : 'Upload failed';
        setError(message);
      }
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Upload a File to R2</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              type="file"
              onChange={e => setFile(e.target.files?.[0] || null)}
              disabled={isUploading}
            />
          </div>

          <Button onClick={handleUpload} disabled={isUploading || !file}>
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>

          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>
          )}

          {result && (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">Uploaded:</div>
              <pre className="rounded-md bg-muted p-3 text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
              {/* Preview image if possible */}
              {typeof result?.url === 'string' && result?.key && (
                <div className="space-y-2">
                  <div className="text-sm">Preview</div>
                  <Image
                    src={result.url}
                    alt={result.key}
                    width={800}
                    height={600}
                    className="h-auto w-full max-w-xl rounded-md border"
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
