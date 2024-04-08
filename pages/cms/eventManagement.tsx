import React, { useEffect, useState } from "react";
import Image from "next/image";
import usePermission from "@/hooks/usePermission";
import { EventProps } from "@/types/interfaces/EventProps";
import { Table, Switch, Button, Modal, message } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const EventManagement = ({ events }: { events: EventProps[] }) => {
  const isAllowed = usePermission();
  const [isShow, setIsShow] = useState<{ [key: string]: boolean }>({});
  const [isCompleteUpload, setIsCompleteUpload] = useState<{
    [key: string]: boolean;
  }>({});
  const [modal, contextHolder] = Modal.useModal();

  const domain = process.env.NEXT_PUBLIC_SERVER_URL;

  useEffect(() => {
    setIsShow(
      events.reduce((acc, curr) => {
        return { ...acc, [curr.eventId]: curr.isShow };
      }, {})
    );
    setIsCompleteUpload(
      events.reduce((acc, curr) => {
        return { ...acc, [curr.eventId]: curr.isCompleteUpload };
      }, {})
    );
  }, [events]);

  const updateEvent = (id: string, reqBody: any) => {
    fetch(`${domain}/api/events/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqBody),
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
        <Image src={coverImg} width={80} height={80} alt="coverImg" />
      ),
    },
    {
      title: "是否顯示在首頁",
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
      title: "是否完成上傳",
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

  return isAllowed ? (
    <div className="container mx-auto my-24 text-slate-600">
      <h1 className="text-center text-2xl mb-10">賽事管理中心</h1>
      <Table dataSource={events} columns={columns} />
      {contextHolder}
    </div>
  ) : (
    <div>
      <h1>Permission Denied</h1>
    </div>
  );
};

export default EventManagement;

export async function getServerSideProps() {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  // Fetch data from external API
  const res = await fetch(`${domain}/api/events`);
  const events = await res.json();

  // Pass data to the page via props
  return { props: { events } };
}
