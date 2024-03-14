import type { NextApiRequest, NextApiResponse } from "next";

export default async function confirm(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const response = req.query;
  const LinePayInfo = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/linepay/confirm`,
    {
      method: "POST",
      body: JSON.stringify(response),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const LinePayData = await LinePayInfo.json();
  if (LinePayData.status === "success") {
    res.redirect(`/user/succeed?orderStatus=SUCCESS`);
  } else {
    res.redirect(`/user/succeed?orderStatus=FAIL`);
  }
}
