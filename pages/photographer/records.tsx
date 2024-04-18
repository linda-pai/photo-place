import React from "react";
import { Spin } from "antd";
import dynamic from "next/dynamic";
import Head from "next/head";
import usePermission from "@/hooks/usePermission";

const RecordOfUploadProps = dynamic(() => import("@/components/records"), {
  loading: () => <Spin />,
});
const records = () => {
  const isAllowed = usePermission();

  return (
    <>
      <Head>
        <title>攝影師上傳紀錄 - {process.env.NEXT_PUBLIC_APP_NAME}</title>
        <meta name="description" content="攝影師上傳紀錄" />
        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_APP_URL}/photographer/records`}
        />
      </Head>

      {isAllowed ? (
        <div className="container mx-auto text-slate-600 my-24 overflow-hidden">
          <h1 className="text-center text-2xl mb-8">攝影師上傳紀錄</h1>
          <RecordOfUploadProps />
        </div>
      ) : (
        <Spin className="mx-auto my-[40vh] w-full" size="large" />
      )}
    </>
  );
};

export default records;
