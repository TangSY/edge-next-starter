import { getCloudflareEnv } from '@/lib/db/client';

/**
 * Get R2 bucket instance
 */
export function getR2Bucket(): R2Bucket | null {
  const env = getCloudflareEnv();
  return env?.BUCKET || null;
}

/**
 * R2 storage client
 */
export class R2Client {
  private bucket: R2Bucket;

  constructor(bucket: R2Bucket) {
    this.bucket = bucket;
  }

  /**
   * Upload file
   */
  async put(
    key: string,
    value: ReadableStream | ArrayBuffer | string,
    options?: R2PutOptions
  ): Promise<R2Object | null> {
    try {
      return await this.bucket.put(key, value, options);
    } catch (error) {
      console.error('R2 put error:', error);
      return null;
    }
  }

  /**
   * Get file
   */
  async get(key: string): Promise<R2ObjectBody | null> {
    try {
      return await this.bucket.get(key);
    } catch (error) {
      console.error('R2 get error:', error);
      return null;
    }
  }

  /**
   * Delete file
   */
  async delete(key: string): Promise<void> {
    try {
      await this.bucket.delete(key);
    } catch (error) {
      console.error('R2 delete error:', error);
    }
  }

  /**
   * List files
   */
  async list(options?: R2ListOptions): Promise<R2Objects | null> {
    try {
      return await this.bucket.list(options);
    } catch (error) {
      console.error('R2 list error:', error);
      return null;
    }
  }

  /**
   * Get file headers
   */
  async head(key: string): Promise<R2Object | null> {
    try {
      return await this.bucket.head(key);
    } catch (error) {
      console.error('R2 head error:', error);
      return null;
    }
  }

  /**
   * Get raw bucket instance
   */
  get raw(): R2Bucket {
    return this.bucket;
  }
}

/**
 * Create R2 client instance
 */
export function createR2Client(): R2Client | null {
  const bucket = getR2Bucket();
  if (!bucket) {
    return null;
  }
  return new R2Client(bucket);
}

/**
 * Helper: upload file
 */
export async function uploadFile(
  key: string,
  file: File | Blob,
  metadata?: Record<string, string>
): Promise<R2Object | null> {
  const client = createR2Client();
  if (!client) {
    return null;
  }

  const arrayBuffer = await file.arrayBuffer();
  return await client.put(key, arrayBuffer, {
    httpMetadata: {
      contentType: file.type || 'application/octet-stream',
    },
    customMetadata: metadata,
  });
}

/**
 * Helper: download file
 */
export async function downloadFile(key: string): Promise<Blob | null> {
  const client = createR2Client();
  if (!client) {
    return null;
  }

  const object = await client.get(key);
  if (!object) {
    return null;
  }

  return await object.blob();
}
