import React, { useEffect, useState } from "react";
import Head from "next/head";
import { Spin } from "antd";
import usePermission from "@/hooks/usePermission";
import dynamic from "next/dynamic";
import { NotifyProps } from "@/types/interfaces/NotifyProps";
import { EventProps } from "@/types/interfaces/EventProps";

const UploadList = dynamic(() => import("@/components/cms/upload/UploadList"), {
  loading: () => <Spin />,
});

const UploadTable = dynamic(
  () => import("@/components/cms/upload/UploadTable"),
  {
    loading: () => <Spin />,
  }
);

const UploadManagement = ({
  events,
  uploadData,
  eventId,
}: {
  events: EventProps[];
  uploadData: any;
  eventId: string;
}) => {
  const title = "攝影師上傳管理 - " + process.env.NEXT_PUBLIC_APP_NAME;
  const [tableData, setTableData] = useState<NotifyProps[]>(uploadData);

  useEffect(() => {
    setTableData(uploadData);
  }, [uploadData]);

  const isAllowed = usePermission();

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="攝影師上傳管理" />
        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_APP_URL}/cms/uploadManagement`}
        />
      </Head>

      {isAllowed ? (
        <>
          <UploadList events={events} />
          <UploadTable tableData={tableData} eventId={eventId} />
        </>
      ) : (
        <Spin className="mx-auto my-[40vh] w-full" size="large" />
      )}
    </>
  );
};
export default UploadManagement;

export async function getServerSideProps(context: any) {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const events = await fetch(`${domain}/api/cms/getUploadInfo`).then((res) =>
    res.json()
  );

  const eventId = context.query.eventId || "";

  const getUploadData = async () => {
    const domain = process.env.NEXT_PUBLIC_SERVER_URL;
    return await fetch(`${domain}/api/cms/getUploadInfo/${eventId}`).then(
      (res) => res.json()
    );
  };

  const uploadData = eventId ? await getUploadData() : [];

  return {
    props: { events, uploadData: uploadData || {}, eventId },
  };
}
