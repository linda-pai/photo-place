import React, { useEffect, useState } from "react";
import Head from "next/head";
import { Spin } from "antd";
import usePermission from "@/hooks/usePermission";
import { useSession, getSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { sha256 } from "js-sha256";
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
  const { data: session }: any = useSession();

  const title = "通知管理 - " + process.env.NEXT_PUBLIC_APP_NAME;
  const [tableData, setTableData] = useState<NotifyProps[]>(notifyData);

  useEffect(() => {
    setTableData(notifyData);
  }, [notifyData]);

  const isAllowed = usePermission();

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="通知管理" />
        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_APP_URL}/cms/notify`}
        />
      </Head>

      {isAllowed ? (
        <>
          <NotifyList events={events} session={session} />
          <NotifyTable
            tableData={tableData}
            eventId={eventId}
            session={session}
          />
        </>
      ) : (
        <Spin className="mx-auto my-[40vh] w-full" size="large" />
      )}
    </>
  );
};
export default Notify;

export async function getServerSideProps(context: any) {
  const session = (await getSession(context)) as any;

  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const events = await fetch(`${domain}/api/events/eventList`).then((res) =>
    res.json()
  );
  const eventId = context.query.eventId || "";

  const getNotifyData = async () => {
    const domain = process.env.NEXT_PUBLIC_SERVER_URL;
    return await fetch(`${domain}/api/cms/notifyRecord/${eventId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        secret: sha256(session.id + process.env.NEXT_PUBLIC_SALT),
      },
    }).then((res) => res.json());
  };

  const notifyData = eventId ? await getNotifyData() : [];

  return {
    props: { events, notifyData: notifyData || {}, eventId },
  };
}
