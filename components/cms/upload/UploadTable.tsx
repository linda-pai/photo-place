import React, { useEffect, useState } from "react";
import { Table, Space, Button, Spin, Modal } from "antd";
import { CopyOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import { UploadProps } from "@/types/interfaces/UploadProps";
import copyToClipboard from "@/utils/copyToClipboard";
import scrollIntoViewWithOffset from "@/utils/scrollIntoViewWithOffset";
import addWaterMarkAndDetect from "@/lib/upload/addWaterMarkAndDetect";

const RecordOfUpload = dynamic(() => import("@/components/records"), {
  loading: () => <Spin />,
});

const UploadTable = ({ tableData, eventId }: any) => {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;

  const [data, setData] = useState<UploadProps[]>(tableData);
  const [uploadData, setUploadData] = useState<{ [key: string]: any }>({});
  const [currAuthor, setCurrAuthor] = useState("");

  const [modal, contextHolder] = Modal.useModal();

  useEffect(() => {
    setData(tableData);
    scrollIntoViewWithOffset("#upload-table", 100);
  }, [tableData]);

  const getUploadDetail = async (record: any) => {
    fetch(`${domain}/api/cms/getImageInfoByEventId/${record.eventId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        author: record.author,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        tableData.map((item: any) => {
          if (item.author === record.author) {
            setUploadData({
              [record.author]: { ...item, ...data },
            });
          }
        });
      });
  };

  const columns = [
    {
      title: "攝影師",
      dataIndex: "author",
      key: "author",
      ellipsis: true,
      render: (text: string, record: UploadProps) => (
        <div>
          <p>{record.name}</p>
          <a
            onClick={() => copyToClipboard(text)}
            className="cursor-pointer overfolw-ellipsis"
            title="複製攝影師 ID"
          >
            <CopyOutlined className="mr-2" />
            {text}
          </a>
        </div>
      ),
    },
    {
      title: "上傳時間",
      dataIndex: "createAt",
      key: "createAt",
      render: (text: string) => dayjs(text).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: "更新時間",
      dataIndex: "lastEditTime",
      key: "lastEditTime",
      render: (text: string) => dayjs(text).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: "詳細資訊",
      dataIndex: "status",
      key: "status",
      width: 800,
      render: (text: string) => {
        return (
          uploadData[currAuthor] && (
            <RecordOfUpload
              uploadData={[uploadData[currAuthor]]}
              key={currAuthor}
              showHeader={false}
            />
          )
        );
      },
    },
    {
      title: "Action",
      key: "action",
      width: 140,
      render: (_: string, record: UploadProps) => (
        <>
          <Space size="middle">
            <Button
              type="primary"
              onClick={() => {
                getUploadDetail(record);
                setCurrAuthor(record.author);
              }}
            >
              載入詳細資訊
            </Button>
          </Space>
        </>
      ),
    },
  ];

  const handleClickDetect = () => {
    modal.confirm({
      title: "一鍵偵測號碼布",
      icon: <ExclamationCircleOutlined />,
      content: `確定要偵測尚未偵測的號碼布嗎？`,
      okText: "確認",
      cancelText: "取消",
      onOk: () => {
        addWaterMarkAndDetect({
          eventId,
          author: "",
          isAll: true,
        });
      },
    });
  };

  return (
    <div className="container mx-auto my-24 text-slate-600" id="upload-table">
      <h1 className="text-center text-2xl mb-10">上傳完成通知列表</h1>
      <div className="w-full flex justify-end my-4 gap-1">
        <Button
          className=""
          danger
          onClick={handleClickDetect}
          disabled={data.length === 0}
        >
          一鍵偵測號碼布
        </Button>
        {contextHolder}
      </div>
      <div>
        <Table dataSource={data} columns={columns} />
      </div>
    </div>
  );
};

export default UploadTable;
