import { useRef } from "react";
import type { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { Spin } from "antd";

import dynamic from "next/dynamic";

import "../styles/globals.css";

const Layout = dynamic(() => import("@/pages/components/Layout"), {
  loading: () => <Spin />,
});

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) {
  const navBarRef = useRef();
  const getLayout = Component.getLayout ?? ((page) => page);
  return getLayout(
    <SessionProvider session={session}>
      <Layout navBarRef={navBarRef}>
        <Component {...pageProps} navBarRef={navBarRef} />
      </Layout>
    </SessionProvider>
  );
}
