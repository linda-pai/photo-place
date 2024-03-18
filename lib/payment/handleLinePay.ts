import createOrder from "@/lib/order/createOrder";
import { paymentConst } from "@/constants";

//LinePay
const handleLinePay = async ({
  orderId,
  totalAmount,
  items,
  isMobile,
  orderBy,
}: {
  orderId: string;
  totalAmount: number;
  items: any[];
  isMobile: boolean;
  orderBy: string;
}) => {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;

  const reqBody = {
    orderId,
    paymentMethod: paymentConst.LINEPAY,
    totalAmount,
    items,
    orderBy,
  };
  createOrder(reqBody);

  const linePayRes = await fetch(`${domain}/api/linepay/request`, {
    method: "POST",
    body: JSON.stringify({
      orderId,
      amount: totalAmount,
      items,
      isMobile,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await linePayRes.json();
};
export default handleLinePay;
