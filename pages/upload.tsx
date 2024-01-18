import React, { useState, useEffect } from "react";
import { message, Select, Spin, Button, Modal, Input } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import userPermission from "@/hooks/usePermission";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import dayjs from "dayjs";

const Uploader = dynamic(() => import("@/pages/components/Uploader"), {
  loading: () => <Spin />,
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

  const [loading, setLoading] = useState(false);
  const [eventId, setEventId] = useState({} as SelectOption);
  const [fileOptionsList, setFileOptinsList] = useState([] as any);
  const [modal, contextHolder] = Modal.useModal();
  const [completeCount, setCompleteCount] = useState(0);
  const [authorName, setAuthorName] = useState(session?.user?.name || "");

  const msgKey = Math.random().toString();

  const loadingMsgConfig = {
    key: msgKey,
    content: "上傳中...",
    duration: 0,
  };

  useEffect(() => {
    setAuthorName(session?.user?.name || "");
  }, [session]);

  const handleSelected = (obj: SelectOption) =>
    setEventId({ value: obj.value, label: obj.label });

  const customRequest = async (imageFile: File[]) => {
    //remove dulicate file
    const updateImageList = imageFile.filter(
      (imageFile) =>
        !fileOptionsList.find((item: File) => {
          if (item.name === imageFile.name) {
            message.error(`${imageFile.name}已經存在`);
            return true;
          }
        })
    );

    setFileOptinsList((prev: any[]) => [...prev, ...updateImageList]);
  };

  //update progresss
  const onSuccess = (imageFile: any, index: number) => {
    setFileOptinsList((prev: any[]) => {
      const updateImage = [...prev];
      updateImage[index] = imageFile;
      return updateImage;
    });
  };

  const writeUploadInfo = async (fileOptionsList: any, uploadId: string) => {
    const response = await fetch(`${domain}/api/images/writeUploadInfo`, {
      method: "POST",
      body: JSON.stringify({
        uploadId,
        eventId: eventId.value,
        eventName: eventId.label,
        author: session.id,
        name: authorName || session.user.name,
        imagesCount: fileOptionsList.length,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());

    if (response.error) {
      message.error(response.error);
      return;
    } else {
    }
  };

  const uploadSinglePhoto = async (index: number, uploadId: string) => {
    const imageFile = fileOptionsList[index];

    const userId = session.id;
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("eventId", eventId.value);
    formData.append("eventName", eventId.label);
    formData.append("author", userId);
    formData.append("uploadId", uploadId);

    const response = await fetch(`${domain}/api/images/uploadAndDetectText`, {
      method: "POST",
      body: formData,
    }).then((res) => res.json());

    if (response.error) {
      message.error(response.error);
      return;
    } else {
      imageFile.progress = response.progress;
      setCompleteCount((prev) => prev + 1);
    }

    onSuccess(imageFile, index);

    if (index === fileOptionsList.length - 1) {
      setLoading(false);
      message.success("全部上傳完成🎉🎉");
      message.destroy(msgKey);

      modal.confirm({
        title: `已上傳完成${fileOptionsList.length}張照片`,
        icon: <ExclamationCircleOutlined />,
        content: `是否要前往活動頁面？`,
        okText: "確認",
        cancelText: "取消",
        onOk: () => {
          window.location.href = `/events/${eventId.value}`;
        },
        onCancel: () => {
          setFileOptinsList([]);
        },
      });
    }
  };

  const handleUpload = async () => {
    if (!session.id) return message.error("請先登入");
    if (!eventId.value) return message.error("請選擇活動");

    modal.confirm({
      title: "上傳照片",
      icon: <ExclamationCircleOutlined />,
      content: `確定要上傳${fileOptionsList.length}張照片嗎？`,
      okText: "確認",
      cancelText: "取消",
      onOk: () => {
        const uploadId =
          eventId.value +
          "_" +
          dayjs().format("YYYYMMDDHHmmss") +
          "_" +
          session.id;
        setLoading(true);
        message.open({ ...loadingMsgConfig, type: "loading" });
        writeUploadInfo(fileOptionsList, uploadId);
        //setTimeout + for loop 每600毫秒上傳一張
        for (var x = 0, ln = fileOptionsList.length; x < ln; x++) {
          setTimeout(
            function (y) {
              uploadSinglePhoto(y, uploadId);
            },
            x * 600,
            x
          );
        }
      },
    });
  };

  const handleChangeAuthorName = (e: any) => {
    setAuthorName(e.target.value);
  };

  return isAllowed ? (
    <>
      <div className="my-24 text-center">
        <div className="my-4">
          <Select
            labelInValue
            placeholder="請選擇活動"
            className="w-1/3 "
            onChange={handleSelected}
            options={eventOption.map((event: any) => ({
              label: event.eventName,
              value: event.eventId,
            }))}
            disabled={loading}
          />
        </div>
        <div>
          <Input
            placeholder="攝影師名稱"
            className="w-1/3"
            onChange={handleChangeAuthorName}
            value={authorName}
            defaultValue={authorName || ""}
            addonBefore="攝影師名稱"
          />
        </div>
      </div>
      <div className="text-center w-full my-10" onClick={handleUpload}>
        <Button disabled={fileOptionsList.length === 0 || loading}>
          確定上傳
        </Button>
      </div>
      {loading && (
        <div className="text-center text-[color:var(--main-color-dark)]">
          上傳進度: {completeCount}/{fileOptionsList.length}
        </div>
      )}
      <div className="mx-auto max-w-[800px] min-h-[30vh]">
        <Uploader
          onChange={customRequest}
          filesList={fileOptionsList}
          loading={loading}
        />
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
