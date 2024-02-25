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

  if (decryptData.Status === "SUCCESS") {
    res.redirect(302, `/user/succeed?orderStatus=SUCCESS`);
  } else {
    res.redirect(`/user/succeed?orderStatus=FAIL`);
  }
}
