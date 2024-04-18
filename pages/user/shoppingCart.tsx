import { Spin } from "antd";
import dynamic from "next/dynamic";
import Head from "next/head";
import useAuth from "@/hooks/useAuth";

const ShoppingCart = dynamic(() => import("@/components/shoppingCart"));

const shoppingCart = () => {
  const isLogin = useAuth();

  return (
    <>
      <Head>
        <title>購物車 - {process.env.NEXT_PUBLIC_APP_NAME}</title>
        <meta name="description" content="購物車" />
        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_APP_URL}/user/shoppingCart`}
        />
      </Head>
      {isLogin ? (
        <div className="container sm:px-4 px-0 mx-auto my-24 text-[color:var(--main-color-dark)]">
          <h1 className="text-center text-2xl mb-4">購物車</h1>
          <ShoppingCart />
        </div>
      ) : (
        <Spin className="mx-auto my-[40vh] w-full" size="large" />
      )}
    </>
  );
};

export default shoppingCart;
