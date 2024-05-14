import { sha256 } from "js-sha256";

const updateOrderData = (updateData, session) => {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  return fetch(`${domain}/api/cms/updateOrder/${updateData.orderId}`, {
    method: "PUT",
    body: JSON.stringify({ ...updateData }),
    headers: {
      "Content-Type": "application/json",
      secret: sha256(session.id + process.env.NEXT_PUBLIC_SALT),
    },
  });
};

export default updateOrderData;
