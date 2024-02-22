import React, { useEffect, useState } from "react";
import { Spin } from "antd";
import usePermission from "@/hooks/usePermission";
import dynamic from "next/dynamic";
import { NotifyProps } from "@/types/interfaces/NotifyProps";

const NotifyList = dynamic(() => import("@/components/notify/NotifyList"), {
  loading: () => <Spin />,
});

const NotifyTable = dynamic(() => import("@/components/notify/NotifyTable"), {
  loading: () => <Spin />,
});

interface Event {
  data: string;
  eventName: string;
  coverImg: string;
  userId: string;
  isShow: boolean;
  eventId: string;
}

const Notify = ({
  events,
  notifyData,
  eventId,
}: {
  events: Event[];
  notifyData: any;
  eventId: string;
}) => {
  const [tableData, setTableData] = useState<NotifyProps[]>(notifyData);

  useEffect(() => {
    setTableData(notifyData);
  }, [notifyData]);

  const isAllowed = usePermission();

  return isAllowed ? (
    <>
      <NotifyList events={events} />
      <NotifyTable tableData={tableData} eventId={eventId} />
    </>
  ) : (
    <Spin className="mx-auto my-[40vh] w-full" size="large" />
  );
};
export default Notify;

export async function getServerSideProps(context: any) {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const events = await fetch(`${domain}/api/events`).then((res) => res.json());
  const eventId = context.query.eventId || "";

  const getNotifyData = async () => {
    const domain = process.env.NEXT_PUBLIC_SERVER_URL;
    return await fetch(
      `${domain}/api/imagesUploadComplete/notifyRecord/${eventId}`
    ).then((res) => res.json());
  };

  const notifyData = eventId ? await getNotifyData() : [];

  return {
    props: { events, notifyData: notifyData || {}, eventId },
  };
}
