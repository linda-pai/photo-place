import React from "react";
import { Spin } from "antd";
import userPermission from "@/hooks/usePermission";
import dynamic from "next/dynamic";

const UploadImages = dynamic(() => import("@/components/upload/UploadImages"), {
  loading: () => <Spin />,
});

interface Event {
  id: number;
  date: string;
  eventName: string;
}

const UploadPage: React.FC<{ eventOption: Event[] }> = ({ eventOption }) => {
  const isAllowed = userPermission();

  return isAllowed ? (
    <>
      <UploadImages eventOption={eventOption} />
    </>
  ) : (
    <Spin className="mx-auto my-[40vh] w-full" size="large" />
  );
};

export async function getServerSideProps(context: any) {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const res = await fetch(`${domain}/api/events/getEventOptions`);
  const eventOption = await res.json();

  return { props: { eventOption } };
}

export default UploadPage;
