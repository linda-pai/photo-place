//藍新金流
const handleNewebPay = async ({
  orderId,
  totalAmount,
  items,
  email,
}: {
  orderId: string;
  totalAmount: number;
  items: any[];
  email: string;
}) => {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;

  const newebpayRes = await fetch(`${domain}/api/newebpay/request`, {
    method: "POST",
    body: JSON.stringify({
      orderId,
      totalAmount,
      items,
      Email: email,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const newebpayData = await newebpayRes.json();

  if (newebpayData.status === "success") {
    try {
      //藍新金流要用form submit
      const form = document.createElement("form");
      form.action = newebpayData.url;
      form.method = "POST";

      Object.keys(newebpayData.result).forEach((key) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = newebpayData.result[key];
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      console.error(err);
    }
  } else if (newebpayData.status === "paid") {
    //已經付款過
    return newebpayData;
  }
};

export default handleNewebPay;
