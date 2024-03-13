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
