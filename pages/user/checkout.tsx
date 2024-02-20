import React from "react";
import dynamic from "next/dynamic";
import { Spin } from "antd";
import useAuth from "@/hooks/useAuth";

const Checkout = dynamic(() => import("@/components/checkout"), {
  loading: () => <Spin />,
});

const checkout = () => {
  const isLogin = useAuth();

  return isLogin ? (
    <>
      <Checkout />
    </>
  ) : (
    <Spin className="mx-auto my-[40vh] w-full" size="large" />
  );
};
export default checkout;
