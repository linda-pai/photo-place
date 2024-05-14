import React from "react";
import type { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { Spin } from "antd";
import { SoldItemProps } from "@/types/interfaces/CartDataProps";
import usePermission from "@/hooks/usePermission";
import dynamic from "next/dynamic";

const SoldList = dynamic(() => import("@/components/soldList"), {
  loading: () => <Spin />,
});

const soldList: React.FC<{ soldData: SoldItemProps[] }> = ({
  eventId,
}: any) => {
  const title = "售出照片列表 - " + process.env.NEXT_PUBLIC_APP_NAME;
  const isAllowed = usePermission();

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="售出照片列表" />
        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_APP_URL}/cms/soldList`}
        />
      </Head>

      {isAllowed ? (
        <SoldList eventId={eventId} />
      ) : (
        <Spin className="mx-auto my-[40vh] w-full" size="large" />
      )}
    </>
  );
};
export default soldList;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const eventId = context.query.eventId;

  return { props: { eventId } };
}
