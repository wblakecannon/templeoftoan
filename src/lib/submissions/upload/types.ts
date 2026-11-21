export interface DeclaredFile {
  originalFilename: string;
  mimeType: string;
  declaredSizeBytes: number;
}

export interface UploadTargetRequest {
  submissionId: string;
  files: DeclaredFile[];
}

export interface UploadTarget {
  objectKey: string;
  mimeType: string;
  uploadUrl: string;
  method: "PUT";
  headers: Record<string, string>;
  expiresInSeconds: number;
}

export interface UploadedMedia {
  objectKey: string;
  mimeType: string;
  sizeBytes: number;
  originalFilename: string;
}

export interface ObjectVerificationResult {
  isValidImage: boolean;
  sniffedMimeType: string | null;
  actualSizeBytes: number;
}

export interface GpxVerificationResult {
  isValidGpx: boolean;
  actualSizeBytes: number;
}

export interface MediaUploadTargetService {
  createUploadTargets(input: UploadTargetRequest): Promise<UploadTarget[]>;
  /** Re-checks an uploaded object's real content (magic bytes) and size, since the server never saw the bytes at presign time. */
  verifyUploadedObject(objectKey: string): Promise<ObjectVerificationResult>;
  /** Same idea as verifyUploadedObject, but for GPX's root-element sniff instead of image magic bytes. */
  verifyUploadedGpxFile(objectKey: string): Promise<GpxVerificationResult>;
  deleteObject(objectKey: string): Promise<void>;
}
