import React, { useEffect, useState } from "react";
import Image from "next/image";
import Head from "next/head";
import usePermission from "@/hooks/usePermission";
import { EventProps } from "@/types/interfaces/EventProps";
import { Table, Switch, Button, Modal, message, Spin } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { DEFAULT_COVER_IMG } from "@/constants";
import dynamic from "next/dynamic";

const Editable = dynamic(() => import("@/components/cms/Editable"), {
  loading: () => <Spin />,
});

const EventManagement = ({
  events,
}: {
  events: EventProps[];
  reviewingEvents: EventProps[];
}) => {
  const isAllowed = usePermission();
  const [isShow, setIsShow] = useState<{ [key: string]: boolean }>({});
  const [isCompleteUpload, setIsCompleteUpload] = useState<{
    [key: string]: boolean;
  }>({});
  const [isReviewed, setIsReviewed] = useState<{ [key: string]: boolean }>({});

  const [eventData, setEventData] = useState<EventProps[]>(events);

  const [modal, contextHolder] = Modal.useModal();

  const domain = process.env.NEXT_PUBLIC_SERVER_URL;

  useEffect(() => {
    setIsShow(
      eventData.reduce((acc, curr) => {
        return { ...acc, [curr.eventId]: curr.isShow };
      }, {})
    );
    setIsCompleteUpload(
      eventData.reduce((acc, curr) => {
        return { ...acc, [curr.eventId]: curr.isCompleteUpload };
      }, {})
    );

    setIsReviewed(
      eventData.reduce((acc, curr) => {
        return { ...acc, [curr.eventId]: curr.isReviewed };
      }, {})
    );
  }, [eventData]);

  const updateEvent = (id: string, reqBody: any) => {
    fetch(`${domain}/api/events/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqBody),
    })
      .then((res) => res.json())
      .then(() => {
        message.success("更新成功");
      });
  };

  const handleOnChange = (checked: boolean, eventId: string, key: string) => {
    const reqBody = { [key]: checked };
    switch (key) {
      case "isShow":
        setIsShow({ ...isShow, [eventId]: checked });
        break;
      case "isCompleteUpload":
        setIsCompleteUpload({ ...isCompleteUpload, [eventId]: checked });
        break;
      case "isReviewed":
        setIsReviewed({ ...isReviewed, [eventId]: checked });
        break;
    }
    updateEvent(eventId, reqBody);
  };

  const handleOnDelete = (eventId: string) => {
    fetch(`${domain}/api/events/delete/${eventId}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then(() => {
        message.success("賽事刪除成功");
        window.location.reload();
      });
  };

  const deleteEvent = (eventId: string) => {
    modal.confirm({
      title: eventId + " 即將刪除賽事 ",
      icon: <ExclamationCircleOutlined />,
      content: "刪除後將無法復原",
      okText: "確認",
      cancelText: "取消",
      onOk: () => handleOnDelete(eventId),
    });
  };

  const handleRemarkChange = (e: any, record: EventProps) => {
    const newEvents = eventData.map((event) => {
      if (event.eventId === record.eventId) {
        return { ...event, description: e.target.value };
      }
      return event;
    });

    setEventData(newEvents);
  };

  const columns = [
    {
      title: "賽事名稱",
      dataIndex: "eventName",
      key: "eventName",
      width: 360,
    },
    {
      title: "日期",
      dataIndex: "date",
      key: "date",
      sorter: (a: EventProps, b: EventProps) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      },
    },
    {
      title: "封面圖",
      dataIndex: "coverImg",
      key: "coverImg",
      render: (coverImg: string) => (
        <Image
          src={coverImg || DEFAULT_COVER_IMG}
          width={80}
          height={80}
          alt="coverImg"
        />
      ),
    },
    {
      title: `審核 (${eventData.filter((event) => !event.isReviewed).length} )`,
      dataIndex: "eventId",
      key: "isReviewed",
      render: (eventId: string) => (
        <Switch
          checked={isReviewed[eventId]}
          onChange={(checked) => handleOnChange(checked, eventId, "isReviewed")}
        />
      ),
      sorter: (a: EventProps, b: EventProps) => {
        return a.isReviewed === b.isReviewed ? 0 : a.isReviewed ? -1 : 1;
      },
    },
    {
      title: "顯示在首頁",
      dataIndex: "eventId",
      key: "isShow",
      render: (eventId: string) => (
        <Switch
          checked={isShow[eventId]}
          onChange={(checked) => handleOnChange(checked, eventId, "isShow")}
        />
      ),
    },
    {
      title: "完成上傳",
      dataIndex: "eventId",
      key: "isCompleteUpload",
      render: (eventId: string) => (
        <Switch
          checked={isCompleteUpload[eventId]}
          onChange={(checked) =>
            handleOnChange(checked, eventId, "isCompleteUpload")
          }
        />
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text: string, record: EventProps) => (
        <Editable
          item={record}
          targetId={record.eventId}
          text={text}
          updateFunction={() =>
            updateEvent(record.eventId, { description: text })
          }
          handleRemarkChange={handleRemarkChange}
        />
      ),
    },
    {
      title: "Action",
      dataIndex: "eventId",
      key: "action",
      render: (eventId: string) => (
        <Button danger onClick={() => deleteEvent(eventId)}>
          刪除賽事
        </Button>
      ),
    },
  ];

  return (
    <>
      <Head>
        <title>賽事管理 - {process.env.NEXT_PUBLIC_APP_NAME}</title>
        <meta name="description" content="賽事管理" />
        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_APP_URL}/cms/eventManagement`}
        />
      </Head>

      {isAllowed ? (
        <div className="container mx-auto my-24 text-slate-600">
          <h1 className="text-center text-2xl mb-10">賽事管理中心</h1>
          <Table dataSource={eventData} columns={columns} />
          {contextHolder}
        </div>
      ) : (
        <div>
          <h1>Permission Denied</h1>
        </div>
      )}
    </>
  );
};

export default EventManagement;

export async function getServerSideProps() {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  // Fetch data from external API
  const events = await fetch(`${domain}/api/events?sort=asc`).then((res) =>
    res.json()
  );

  // Pass data to the page via props
  return { props: { events } };
}
