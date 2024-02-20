export interface CartDataProps {
  id: string;
  watermarkedUrl: string;
  eventId: string;
  price: string;
}

export interface Order {
  orderId: number;
  totalAmount: number;
  createAt: string;
  paidAt: string;
  paymentMethod: string;
  orderBy: string;
  items: CartDataProps[];
}

export interface OrderListProps {
  orders: Order[];
}
