import React from "react";
import Head from "next/head";
import { Spin } from "antd";
import { useRouter } from "next/router";
import userPermission from "@/hooks/usePermission";

import dynamic from "next/dynamic";

const CreateEventBlock = dynamic(
  () => import("@/components/event/CreateEventBlock"),
  {
    loading: () => <Spin />,
  }
);

const CreateEventPage: React.FC = () => {
  const isAllowed = userPermission();

  const router = useRouter();

  return (
    <>
      <Head>
        <title>新增活動</title>
        <meta name="description" content="新增活動" />
        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_APP_URL}/createEvent`}
        />
      </Head>
      {isAllowed ? (
        <div className="container mx-auto h-[100vh] flex flex-col justify-center">
          <CreateEventBlock
            handleOnSuccess={() => router.push("/")}
            isShowImageUpload={false}
          />
        </div>
      ) : (
        <Spin className="mx-auto my-[40vh] w-full" size="large" />
      )}
    </>
  );
};

export default CreateEventPage;
