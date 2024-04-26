import React from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { Spin } from "antd";
import useAuth from "@/hooks/useAuth";

const Checkout = dynamic(() => import("@/components/checkout"), {
  loading: () => <Spin />,
});

const checkout = () => {
  const title = "訂單明細 - " + process.env.NEXT_PUBLIC_APP_NAME;
  const isLogin = useAuth();

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="訂單明細" />
        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_APP_URL}/user/checkout`}
        />
      </Head>
      {isLogin ? (
        <div className="container sm:px-4 px-0 mx-auto my-24 text-[color:var(--main-color-dark)]">
          <h1 className="text-center text-2xl mb-10">訂單明細</h1>
          <Checkout />
        </div>
      ) : (
        <Spin className="mx-auto my-[40vh] w-full" size="large" />
      )}
    </>
  );
};
export default checkout;
