const updateOrderData = (updateData) => {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  return fetch(`${domain}/api/orders/update/${updateData.orderId}`, {
    method: "PUT",
    body: JSON.stringify({ ...updateData }),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export default updateOrderData;
