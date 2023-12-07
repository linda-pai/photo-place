import React, { useState } from "react";
import type { UploadProps } from "antd";
import { message, Select, Spin, Button, Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import userPermission from "@/hooks/userPermission";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";

const Uploader = dynamic(() => import("@/pages/components/Uploader"), {
  ssr: false,
});

interface Event {
  id: number;
  date: string;
  eventName: string;
}

interface SelectOption {
  value: string;
  label: string;
}

const UploadPage: React.FC<{ eventOption: Event[] }> = ({ eventOption }) => {
  const { data: session }: any = useSession();
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const isAllowed = userPermission();

  const [eventId, setEventId] = useState({} as SelectOption);
  const [fileOptionsList, setFileOptinsList] = useState([] as any);
  const [modal, contextHolder] = Modal.useModal();

  const handleSelected = (obj: SelectOption) =>
    setEventId({ value: obj.value, label: obj.label });

  const customRequest = async (option: any) => {
    setFileOptinsList((prev: any[]) => [...prev, option]);
  };

  const uploadSinglePhoto = async (index: number) => {
    const option = fileOptionsList[index];
    const file = option.file as File;
    const userId = session.id;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("eventId", eventId.value);
    formData.append("eventName", eventId.label);
    formData.append("author", userId);

    const response = await fetch(`${domain}/api/images/uploadAndDetectText`, {
      method: "POST",
      body: formData,
    }).then((res) => res.json());

    option.onSuccess(response.url);

    if (index === fileOptionsList.length - 1) {
      message.success("全部上傳完成🎉🎉");
    }
  };

  const handleUpload = async () => {
    if (!session.id) return message.error("請先登入");
    // if (!eventId.value) return message.error("請選擇活動");

    modal.confirm({
      title: "上傳照片",
      icon: <ExclamationCircleOutlined />,
      content: `確定要上傳${fileOptionsList.length}張照片嗎？`,
      okText: "確認",
      cancelText: "取消",
      onOk: () => {
        //setInterval + for loop 1秒上傳一張
        for (var x = 0, ln = fileOptionsList.length; x < ln; x++) {
          setTimeout(
            function (y) {
              uploadSinglePhoto(y);
            },
            x * 1000,
            x
          );
        }
      },
    });
  };

  const props: UploadProps = {
    name: "file",
    multiple: true,
    customRequest,
    onChange(info) {
      const { status } = info.file;
      if (status !== "uploading") {
      }
      if (status === "done") {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {},
  };

  return isAllowed ? (
    <>
      <div className="my-24 flex justify-center">
        <Select
          labelInValue
          placeholder="請選擇活動"
          className="w-1/3 "
          onChange={handleSelected}
          options={eventOption.map((event: any) => ({
            label: event.date + "-" + event.eventName,
            value: event.eventId,
          }))}
        />
      </div>
      <div className="text-center w-full my-10" onClick={handleUpload}>
        <Button disabled={fileOptionsList.length === 0}>確定上傳</Button>
      </div>
      <div className="mx-auto max-w-[800px] min-h-[30vh]">
        <Uploader {...props} />
      </div>
      {contextHolder}
    </>
  ) : (
    <Spin className="mx-auto my-[40vh] w-full" size="large" />
  );
};

export async function getServerSideProps(context: any) {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  // Fetch data from external API
  const res = await fetch(`${domain}/api/events/getEventOptions`);
  const eventOption = await res.json();

  // Pass data to the page via props
  return { props: { eventOption } };
}

export default UploadPage;
