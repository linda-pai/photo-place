import Head from "next/head";
import { Spin } from "antd";
import useAuth from "@/hooks/useAuth";
import dynamic from "next/dynamic";

const Orders = dynamic(() => import("@/components/orders"), {
  loading: () => <Spin />,
});

const orders = () => {
  const isLogin = useAuth();

  return (
    <>
      <Head>
        <title>訂單查詢 - {process.env.NEXT_PUBLIC_APP_NAME}</title>
        <meta name="description" content="訂單查詢" />
        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_APP_URL}/user/orders`}
        />
      </Head>
      {isLogin ? (
        <div className="container mx-auto text-slate-600 my-24 overflow-hidden">
          <h1 className="text-center text-2xl mb-8">訂單查詢</h1>
          <Orders />
        </div>
      ) : (
        <Spin className="mx-auto my-[40vh] w-full" size="large" />
      )}
    </>
  );
};

export default orders;
