export interface ImageDataProps {
  eventId: number;
  watermarkedUrl: string;
  id: string;
  price: number;
}

export interface ImageItemProps {
  eventId: string;
  eventName: string;
  id: string;
  watermarkedUrl: string;
  url: string;
  path?: any;
  isFeatured?: boolean;
  isRemoved: boolean;
  lastModified?: string;
}
