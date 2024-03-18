const createOrder = async (reqBody) => {
  //成立訂單
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  fetch(`${domain}/api/orders/add`, {
    method: "POST",
    body: JSON.stringify(reqBody),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(async (res) => {
      if (res.status === 200) {
        await removeFromCookieData();
        await gotoPayment(reqBody.orderId);
      }
    })
    .catch((err) => {
      console.log("err", err);
    });
};

export default createOrder;
