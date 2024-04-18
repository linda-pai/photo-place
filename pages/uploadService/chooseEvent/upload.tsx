import React from "react";
import { Spin } from "antd";
import userPermission from "@/hooks/usePermission";
import dynamic from "next/dynamic";
import Head from "next/head";

const UploadImages = dynamic(() => import("@/components/upload/UploadImages"), {
  loading: () => <Spin />,
});

const UploadPage: React.FC<{ eventId: string }> = ({ eventId }) => {
  const isAllowed = userPermission();

  return (
    <>
      <Head>
        <title>上傳照片</title>
        <meta name="description" content="上傳照片" />
        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_APP_URL}/uploadService/chooseEvent/upload`}
        />
      </Head>
      {isAllowed ? (
        <>
          <UploadImages eventId={eventId} />
        </>
      ) : (
        <Spin className="mx-auto my-[40vh] w-full" size="large" />
      )}
    </>
  );
};

export async function getServerSideProps(context: any) {
  const eventId = context.query.eventId || "";

  return { props: { eventId } };
}

export default UploadPage;
