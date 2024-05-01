import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import { Spin } from "antd";
import dynamic from "next/dynamic";
import Head from "next/head";
import usePermission from "@/hooks/usePermission";
import { RecordOfUploadProps } from "@/types/interfaces/UploadProps";

const RecordOfUpload = dynamic(() => import("@/components/records"), {
  loading: () => <Spin />,
});
const records = () => {
  const title = "攝影師成就 - " + process.env.NEXT_PUBLIC_APP_NAME;
  const isAllowed = usePermission();
  const { data: session }: any = useSession();

  const domain = process.env.NEXT_PUBLIC_SERVER_URL;

  const [uploadData, setUploadData] = useState([] as RecordOfUploadProps[]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) getUploadDetail();
  }, [session]);

  const getUploadDetail = async () => {
    fetch(`${domain}/api/photographer/getUploadInfo/${session.id}`)
      .then((res) => res.json())
      .then((data) => {
        setUploadData(data);
        setLoading(false);
      });
  };
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="攝影師成就" />
        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_APP_URL}/photographer/records`}
        />
      </Head>

      {isAllowed && !loading ? (
        <div className="container mx-auto text-slate-600 my-24 overflow-hidden">
          <h1 className="text-center text-2xl mb-8">攝影師成就</h1>
          <RecordOfUpload uploadData={uploadData} showHeader={true} />
        </div>
      ) : (
        <Spin className="mx-auto my-[40vh] w-full" size="large" />
      )}
    </>
  );
};

export default records;
