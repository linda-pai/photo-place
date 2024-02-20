import React from "react";
import { Spin } from "antd";

import { Order } from "@/types/interfaces/CartDataProps";
import usePermission from "@/hooks/usePermission";
import dynamic from "next/dynamic";

const OrderList = dynamic(() => import("@/components/orderList"), {
  loading: () => <Spin />,
});

const orderList: React.FC<{ orders: Order[] }> = ({ orders }) => {
  const isAllowed = usePermission();

  return isAllowed ? (
    <OrderList orders={orders} />
  ) : (
    <Spin className="mx-auto my-[40vh] w-full" size="large" />
  );
};
export default orderList;

export async function getServerSideProps() {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const res = await fetch(`${domain}/api/orders`);
  const orders = await res.json();

  return {
    props: { orders },
  };
}
