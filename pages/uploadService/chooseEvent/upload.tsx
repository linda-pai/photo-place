import React from "react";
import { Spin } from "antd";
import userPermission from "@/hooks/usePermission";
import dynamic from "next/dynamic";

const UploadImages = dynamic(() => import("@/components/upload/UploadImages"), {
  loading: () => <Spin />,
});

const UploadPage: React.FC<{ eventId: string }> = ({ eventId }) => {
  const isAllowed = userPermission();

  return isAllowed ? (
    <>
      <UploadImages eventId={eventId} />
    </>
  ) : (
    <Spin className="mx-auto my-[40vh] w-full" size="large" />
  );
};

export async function getServerSideProps(context: any) {
  const eventId = context.query.eventId || "";

  return { props: { eventId } };
}

export default UploadPage;
