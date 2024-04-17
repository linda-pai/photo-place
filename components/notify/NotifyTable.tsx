import React, { useEffect, useState } from "react";
import { Table, Modal, Space, Button, message } from "antd";
import { ExclamationCircleOutlined, CopyOutlined } from "@ant-design/icons";
import { NotifyProps } from "@/types/interfaces/NotifyProps";
import copyToClipboard from "@/utils/copyToClipboard";
import scrollIntoViewWithOffset from "@/utils/scrollIntoViewWithOffset";

const NotifyTable = ({ tableData, eventId }: any) => {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;

  const [data, setData] = useState<NotifyProps[]>(tableData);
  const yetSend = data.filter((item) => item.status === "pending");

  useEffect(() => {
    setData(tableData);
    scrollIntoViewWithOffset("#notify-table", 100);
  }, [tableData]);

  const columns = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
      ellipsis: true,
      render: (text: string) => (
        <a
          onClick={() => copyToClipboard(text)}
          className="cursor-pointer"
          title="複製Email"
        >
          <CopyOutlined className="mr-2" />
          {text}
        </a>
      ),
    },

    {
      title: "通知連結",
      dataIndex: "notifyUrl",
      key: "notifyUrl",
      render: (text: string) => (
        <a href={text} target="_blank" rel="noreferrer">
          {text}
        </a>
      ),
    },
    {
      title: "活動名稱",
      dataIndex: "eventName",
      key: "eventName",
      ellipsis: true,
    },
    {
      title: "登記時間",
      dataIndex: "creatAt",
      key: "creatAt",
      width: 160,
    },

    {
      title: "通知時間",
      dataIndex: "notifyAt",
      key: "notifyAt",
      width: 160,
    },
    {
      title: "Action",
      key: "action",
      width: 140,
      render: (_: string, record: NotifyProps) => (
        <>
          <Space size="middle">
            <Button type="primary" onClick={() => confirmSendEmail(record)}>
              寄送通知
            </Button>
          </Space>
        </>
      ),
    },
  ];

  const [loading, setLoading] = useState(false);
  const [modal, contextHolder] = Modal.useModal();

  const confirmSendEmail = (record: NotifyProps) => {
    modal.confirm({
      title: record.notifyId + " 即將寄出通知信 ",
      icon: <ExclamationCircleOutlined />,
      content: record.notifyAt
        ? "通知已寄出，將再次寄出"
        : "請確認是否要寄出通知",
      okText: "確認",
      cancelText: "取消",
      onOk: () => sendEmail(record),
    });
  };

  const getNotifyData = (eventId: string) => {
    fetch(`${domain}/api/imagesUploadComplete/notifyRecord/${eventId}`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
      });
  };

  const sendEmail = async (record: NotifyProps) => {
    setLoading(true);

    await fetch(`${domain}/api/imagesUploadComplete/sendEmail`, {
      method: "POST",
      body: JSON.stringify(record),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then(() => {
        getNotifyData(eventId);
        setLoading(false);
        return message.success("通知寄送成功");
      })
      .catch((err) => {
        setLoading(false);
        console.log("err", err);
        return message.error("通知寄送失敗");
      });
  };

  const sendAllEmail = async (eventId: string, isAll: boolean) => {
    setLoading(true);

    await fetch(`${domain}/api/imagesUploadComplete/sendAllEmail/${eventId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isAll,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        getNotifyData(eventId);
        setLoading(false);
        return message.success("通知寄送成功");
      })
      .catch((err) => {
        setLoading(false);
        console.log("err", err);
        return message.error("通知寄送失敗");
      });
  };

  const handleClickSendAll = () => {
    modal.confirm({
      title: "一鍵寄送通知",
      icon: <ExclamationCircleOutlined />,
      content: `確定要寄送 ${eventId} 所有通知嗎？`,
      okText: "確認",
      cancelText: "取消",
      onOk: () => sendAllEmail(eventId, true),
    });
  };

  const handleClickSendNotYet = () => {
    modal.confirm({
      title: "一鍵寄送尚未寄出通知",
      icon: <ExclamationCircleOutlined />,
      content: `確定要寄送 ${eventId}尚未寄出通知共${yetSend.length}則嗎？`,
      okText: "確認",
      cancelText: "取消",
      onOk: () => {
        sendAllEmail(eventId, false);
      },
    });
  };

  return (
    <div className="container mx-auto my-24 text-slate-600" id="notify-table">
      <h1 className="text-center text-2xl mb-10">上傳完成通知列表</h1>
      <div className="w-full flex justify-end my-4 gap-1">
        <Button
          className=""
          danger
          onClick={handleClickSendAll}
          disabled={data.length === 0}
        >
          一鍵寄送通知
        </Button>
        {yetSend.length > 0 && (
          <Button
            className=""
            danger
            onClick={handleClickSendNotYet}
            disabled={data.length === 0}
          >
            一鍵寄送尚未寄出通知
          </Button>
        )}
      </div>
      <div>
        <Table dataSource={data} columns={columns} loading={loading} />
        {contextHolder}
      </div>
    </div>
  );
};

export default NotifyTable;
