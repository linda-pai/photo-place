export interface UploadProps {
  name: string;
  author: string;
  createAt: string;
  eventId: string;
  eventName: string;
  imagesCount: number;
  soldCount: number;
}

export interface RecordOfUploadProps {
  author: string;
  createAt: string;
  eventId: string;
  eventName: string;
  images: any[];
  uploadId: string;
  date: string;
  allImageLength: number;
  featuredLength: number;
  removeImageLength: number;
  detectedImageLength: number;
}
