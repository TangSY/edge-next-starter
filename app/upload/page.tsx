/**
 * Upload Page
 * Simple UI to upload a file to R2 via /api/upload
 */

'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import Link from 'next/link';
import { UploadService, type UploadResult } from '@/services';
import { ApiError } from '@/lib/http';

export default function UploadPage() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [results, setResults] = useState<UploadResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function handleUpload() {
    if (!files || files.length === 0) {
      setError('Please choose file(s)');
      return;
    }
    setIsUploading(true);
    setError(null);
    setResult(null);

    try {
      if (files.length === 1) {
        const uploadResult = await UploadService.uploadFile(files[0]);
        setResult(uploadResult);
        setResults(null);
      } else {
        const uploadResults = await UploadService.uploadFiles(files);
        setResults(uploadResults);
        setResult(null);
      }
      setFiles(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
          <div className="flex items-center justify-between">
            <CardTitle>Upload a File to R2</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/">Back Home</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              type="file"
              ref={fileInputRef}
              multiple
              onChange={e => setFiles(e.target.files || null)}
              disabled={isUploading}
            />
          </div>

          <Button onClick={handleUpload} disabled={isUploading || !files || files.length === 0}>
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

          {results && results.length > 0 && (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">Uploaded Files:</div>
              <pre className="rounded-md bg-muted p-3 text-sm overflow-auto">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
