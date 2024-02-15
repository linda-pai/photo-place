import React, { useState, useEffect } from "react";
import { message, Select, Spin, Button, Modal, Input, Progress } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import userPermission from "@/hooks/usePermission";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import dayjs from "dayjs";

const Uploader = dynamic(() => import("@/components/Uploader"), {
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
  const [detectCount, setDetectCount] = useState(0);
  const [authorName, setAuthorName] = useState(session?.user?.name || "");

  const msgKey = Math.random().toString();

  useEffect(() => {
    setAuthorName(session?.user?.name || "");
  }, []);

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

  const handleOnFinishAll = async () => {
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
  };

  //add watermark and upload after detect text
  const addWatermarkandUpload = async (
    key: string,
    index: number,
    uploadId: string
  ) => {
    await fetch(`${domain}/api/images/addWatermark`, {
      method: "POST",
      body: JSON.stringify({
        key,
        eventId: eventId.value,
        fileName: fileOptionsList[index].name,
        lastModified: fileOptionsList[index].lastModified,
        author: session.id,
        uploadId,
        price: 159,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.error) {
          message.error(res.error);
          return;
        } else {
          setDetectCount((prev) => prev + 1);
        }
      });
  };

  const uploadSinglePhoto = async (index: any, uploadId: string) => {
    const response = await fetch(`${domain}/api/images/getSignedUploadURL`, {
      method: "POST",
      body: JSON.stringify({
        eventId: eventId.value,
        fileName: fileOptionsList[index].name,
        uploadId,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());

    if (response.error) {
      message.error(response.error);
      return;
    } else {
      const { signedUrl, key } = response;
      const imageFile = fileOptionsList[index];

      await fetch(signedUrl, {
        method: "PUT",
        body: imageFile,
        headers: {
          "Content-Type": "image/*",
        },
      })
        .then((res) => {
          if (res.status === 200) {
            setCompleteCount((prev) => prev + 1);
            addWatermarkandUpload(key, index, uploadId);
          } else {
            return message.error("上傳失敗");
          }
        })
        .catch((err) => {
          console.log("err", err);
          return { error: err };
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
        const uploadId = eventId.value + "_" + dayjs().format("YYYYMMDDHHmmss");
        setLoading(true);

        const loadingMsgConfig = {
          key: msgKey,
          content: "上傳中...",
          duration: 0,
        };
        message.open({ ...loadingMsgConfig, type: "loading" });
        writeUploadInfo(fileOptionsList, uploadId);

        const asyncOperation = async (i: number, item: any) => {
          return new Promise((resolve) => {
            setTimeout(async () => {
              await uploadSinglePhoto(i, uploadId);
              resolve(`Result for ${item}`);
            }, 100); // Simulating a 100ms delay
          });
        };

        //一張完成後再上傳下一張
        const processAsyncOperations = async () => {
          try {
            const processedResults = [];
            for (let i = 0; i < fileOptionsList.length; i++) {
              const result = await asyncOperation(i, fileOptionsList[i]);
              processedResults.push(result);
            }
            if (processedResults.length === fileOptionsList.length)
              handleOnFinishAll();
          } catch (error) {
            console.error(error);
          }
        };

        processAsyncOperations();
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
      <div className="text-center w-fit mx-auto my-10" onClick={handleUpload}>
        <Button disabled={fileOptionsList.length === 0 || loading}>
          確定上傳
        </Button>
      </div>
      {fileOptionsList.length > 0 && (
        <>
          <div className="text-center text-[color:var(--main-color-dark)]">
            照片上傳進度: {completeCount}/{fileOptionsList.length}
          </div>
          <div className="w-1/3 mx-auto">
            <Progress
              percent={Math.ceil(
                (completeCount / fileOptionsList.length) * 100
              )}
            />
          </div>
          <div className="text-center text-[color:var(--main-color-dark)]">
            號碼布偵測進度: {detectCount}/{fileOptionsList.length}
          </div>
          <div className="w-1/3 mx-auto">
            <Progress
              percent={Math.ceil((detectCount / fileOptionsList.length) * 100)}
            />
          </div>
        </>
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
  const res = await fetch(`${domain}/api/events/getEventOptions`);
  const eventOption = await res.json();

  return { props: { eventOption } };
}

export default UploadPage;
