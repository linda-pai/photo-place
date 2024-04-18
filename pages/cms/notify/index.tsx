import React, { useEffect, useState } from "react";
import Head from "next/head";
import { Spin } from "antd";
import usePermission from "@/hooks/usePermission";
import dynamic from "next/dynamic";
import { NotifyProps } from "@/types/interfaces/NotifyProps";
import { EventProps } from "@/types/interfaces/EventProps";

const NotifyList = dynamic(() => import("@/components/notify/NotifyList"), {
  loading: () => <Spin />,
});

const NotifyTable = dynamic(() => import("@/components/notify/NotifyTable"), {
  loading: () => <Spin />,
});

const Notify = ({
  events,
  notifyData,
  eventId,
}: {
  events: EventProps[];
  notifyData: any;
  eventId: string;
}) => {
  const [tableData, setTableData] = useState<NotifyProps[]>(notifyData);

  useEffect(() => {
    setTableData(notifyData);
  }, [notifyData]);

  const isAllowed = usePermission();

  return (
    <>
      <Head>
        <title>通知管理 - {process.env.NEXT_PUBLIC_APP_NAME}</title>
        <meta name="description" content="通知管理" />
        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_APP_URL}/cms/notify`}
        />
      </Head>

      {isAllowed ? (
        <>
          <NotifyList events={events} />
          <NotifyTable tableData={tableData} eventId={eventId} />
        </>
      ) : (
        <Spin className="mx-auto my-[40vh] w-full" size="large" />
      )}
    </>
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
