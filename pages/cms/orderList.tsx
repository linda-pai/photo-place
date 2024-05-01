import React from "react";
import Head from "next/head";
import { Spin } from "antd";
import { Order } from "@/types/interfaces/CartDataProps";
import usePermission from "@/hooks/usePermission";
import dynamic from "next/dynamic";

const OrderList = dynamic(() => import("@/components/orderList"), {
  loading: () => <Spin />,
});

const orderList: React.FC<{ orders: Order[] }> = ({ orders }) => {
  const title = "訂單列表 - " + process.env.NEXT_PUBLIC_APP_NAME;
  const isAllowed = usePermission();

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="訂單列表" />
        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_APP_URL}/cms/orderList`}
        />
      </Head>

      {isAllowed ? (
        <OrderList orders={orders} />
      ) : (
        <Spin className="mx-auto my-[40vh] w-full" size="large" />
      )}
    </>
  );
};
export default orderList;

export async function getServerSideProps() {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const res = await fetch(`${domain}/api/orders/orderList`);
  const orders = await res.json();

  return {
    props: { orders },
  };
}
