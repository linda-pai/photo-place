import type { NextApiRequest, NextApiResponse } from "next";
export default async function confirm(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const response = req.body;
  const decryptData = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/newebpay/decrypt`,
    {
      method: "POST",
      body: JSON.stringify(response),
      headers: { "Content-Type": "application/json" },
    }
  ).then((res) => res.json());

  res.redirect(
    `/newebpay/confirm?status=${decryptData.Status}&orderId=${decryptData.Result.ItemDesc}&transactionId=${decryptData.Result.TradeNo}&merchantOrderNo=${decryptData.Result.MerchantOrderNo}`
  );
}
