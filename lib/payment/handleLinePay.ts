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

  const linePayRes = await fetch(`${domain}/api/linepay/request`, {
    method: "POST",
    body: JSON.stringify({
      orderId,
      amount: totalAmount,
      items,
      isMobile,
      orderBy,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await linePayRes.json();
};
export default handleLinePay;
