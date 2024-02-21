import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import {
  Select,
  Input,
  InputNumber,
  Button,
  Progress,
  Spin,
  message,
  Modal,
} from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import getSignedUploadURL from "@/lib/upload/getSignedUploadURL";
import processAsyncOperations from "@/utils/processAsyncOperations";
import addWatermark from "@/lib/upload/addWatermark";
import writeUploadInfo from "@/lib/upload/writeUploadInfo";

interface Event {
  id: number;
  date: string;
  eventName: string;
}

interface SelectOption {
  value: string;
  label: string;
}

const Uploader = dynamic(() => import("@/components/upload/Uploader"), {
  loading: () => <Spin />,
});

const UploadImages = ({ eventOption }: { eventOption: Event[] }) => {
  const { data: session }: any = useSession();

  const [loading, setLoading] = useState(false);
  const [eventId, setEventId] = useState({} as SelectOption);
  const [fileOptionsList, setFileOptinsList] = useState([] as any);
  const [completeCount, setCompleteCount] = useState(0);
  const [detectCount, setDetectCount] = useState(0);

  const [modal, contextHolder] = Modal.useModal();
  const [authorName, setAuthorName] = useState(session?.user?.name || "");
  const [price, setPrice] = useState(159);

  const msgKey = Math.random().toString();
  const uploadId = dayjs().format("YYYYMMDDHHmmsss");

  useEffect(() => {
    setAuthorName(session?.user?.name || "");
  }, []);

  const handleSelected = (obj: SelectOption) =>
    setEventId({ value: obj.value, label: obj.label });

  const handleChangeAuthorName = (e: any) => setAuthorName(e.target.value);
  const handleChangePrice = (value: any) => setPrice(value);

  const handleOnUploaderChange = async (imageFile: File[]) => {
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

  const writeUploadInfoToDB = async (fileOptionsList: File[]) => {
    const reqBody = {
      uploadId,
      eventId: eventId.value,
      eventName: eventId.label,
      author: session.id,
      name: authorName || session.user.name,
      imagesCount: fileOptionsList.length,
      price,
    };

    const response = await writeUploadInfo(reqBody);

    if (response.error) {
      message.error(response.error);
      return;
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
  const addWatermarkandUpload = async (key: string, index: number) => {
    const reqBody = {
      key,
      eventId: eventId.value,
      eventName: eventId.label,
      fileName: fileOptionsList[index].name,
      lastModified: fileOptionsList[index].lastModified,
      author: session.id,
      uploadId,
      price,
    };
    const response = await addWatermark(reqBody);

    if (response.error) {
      message.error(response.error);
      return;
    } else {
      setDetectCount((prev) => prev + 1);
    }
  };

  const uploadSinglePhoto = async (index: any) => {
    const reqBody = {
      fileName: fileOptionsList[index].name,
      eventId: eventId.value,
      uploadId,
    };
    const resSignedURL = await getSignedUploadURL(reqBody);

    if (resSignedURL.error) {
      message.error(resSignedURL.error);
      return;
    } else {
      const { signedUrl, key } = resSignedURL;

      await fetch(signedUrl, {
        method: "PUT",
        body: fileOptionsList[index],
        headers: {
          "Content-Type": "image/*",
        },
      })
        .then((res) => {
          if (res.status === 200) {
            setCompleteCount((prev) => prev + 1);
            addWatermarkandUpload(key, index);
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
        setLoading(true);

        const loadingMsgConfig = {
          key: msgKey,
          content: "上傳中...",
          duration: 0,
        };
        message.open({ ...loadingMsgConfig, type: "loading" });
        //寫入上傳資訊
        writeUploadInfoToDB(fileOptionsList);

        //一張完成後再上傳下一張
        processAsyncOperations(
          fileOptionsList,
          uploadSinglePhoto,
          handleOnFinishAll
        );
      },
    });
  };

  return (
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
        <div>
          <InputNumber
            placeholder="照片價格"
            className="w-1/3 my-2"
            onChange={handleChangePrice}
            value={price}
            defaultValue={price || ""}
            addonBefore="照片價格"
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
          onChange={handleOnUploaderChange}
          filesList={fileOptionsList}
          loading={loading}
        />
      </div>
      {contextHolder}
    </>
  );
};

export default UploadImages;
