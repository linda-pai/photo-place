export interface UploadProps {
  name: string;
  author: string;
  createAt: string;
  lastEditTime: string;
  eventId: string;
  eventName: string;
  imagesCount: number;
  soldCount: number;
}

export interface RecordOfUploadProps {
  author: string;
  name: string;
  createAt: string;
  eventId: string;
  eventName: string;
  images: any[];
  uploadId: string;
  date: string;
  soldCount: number;
  soldImages: any[];
  allImageLength: number;
  featuredLength: number;
  removeImageLength: number;
  detectedImageLength: number;
}
