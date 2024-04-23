export interface CartDataProps {
  id: string;
  watermarkedUrl: string;
  eventId: string;
  price: string;
}

export interface Order {
  _id: any;
  orderId: string;
  totalAmount: number;
  createAt: string;
  paidAt: string;
  paymentMethod: string;
  orderBy: string;
  items: CartDataProps[];
  remark?: string;
}

export interface OrderListProps {
  orders: Order[];
}

export interface SoldItemProps {
  id: string;
  watermarkedUrl: string;
  price: string;
  fileName: string;
  author: string;
}

export interface SoldImagesProps {
  orderId: string;
  images: SoldItemProps[];
  soldAt: string;
}

export interface SoldImageItemProps {
  eventName: string;
  eventId: string;
  date: string;
  soldImages: SoldImagesProps[];
}
