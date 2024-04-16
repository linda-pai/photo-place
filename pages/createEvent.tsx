import React from "react";
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

  return isAllowed ? (
    <div className="container mx-auto h-[100vh] flex flex-col justify-center">
      <CreateEventBlock
        handleOnSuccess={() => router.push("/")}
        isShowImageUpload={true}
      />
    </div>
  ) : (
    <Spin className="mx-auto my-[40vh] w-full" size="large" />
  );
};

export default CreateEventPage;
