/**
 * Upload API Service
 * Handles file upload operations to R2 storage
 */

import { httpClient } from '@/lib/http';

/**
 * Upload result type
 */
export interface UploadResult {
  key: string;
  size?: number;
  etag?: string;
  url?: string;
  uploaded?: string | number | boolean | null;
}

/**
 * Upload API service
 */
export class UploadService {
  /**
   * Upload a file to R2 storage
   * @param file - File to upload
   * @returns Upload result with file metadata
   */
  static async uploadFile(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await httpClient.post<{ success: true; data: UploadResult }>(
      '/api/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data;
  }

  /**
   * Upload multiple files to R2 storage
   * @param files - Files to upload
   * @returns Array of upload results
   */
  static async uploadFiles(files: FileList | File[]): Promise<UploadResult[]> {
    const list = Array.from(files as FileList | File[]);
    const results: UploadResult[] = [];
    for (const file of list) {
      const res = await this.uploadFile(file);
      results.push(res);
    }
    return results;
  }
}
