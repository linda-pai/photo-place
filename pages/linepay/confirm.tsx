//TODO:看之後是否要把這個頁面搬到user/orders
import { Spin } from "antd";

const Confirm = () => {
  return <Spin className="mx-auto my-[40vh] w-full" size="large" />;
};

export default Confirm;

export async function getServerSideProps(context: any) {
  const transactionId = context.query.transactionId || "";
  const orderId = context.query.orderId || "";
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;

  const res = await fetch(`${domain}/api/orders/update/${orderId}`, {
    method: "PUT",
    body: JSON.stringify({
      transactionId,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();

  if (data) {
    return {
      redirect: {
        destination: "/user/orders",
        permanent: false,
      },
    };
  }

  return {
    props: { transactionId, orderId },
  };
}
