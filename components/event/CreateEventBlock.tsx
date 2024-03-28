import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { Input, Button, DatePicker, Image, Spin, message } from "antd";
import type { DatePickerProps } from "antd";
import dynamic from "next/dynamic";

const Uploader = dynamic(() => import("@/components/upload/Uploader"), {
  loading: () => <Spin />,
});

const CreateEventBlock = ({
  handleOnSuccess,
  isShowImageUpload,
}: {
  handleOnSuccess: () => void;
  isShowImageUpload: boolean;
}) => {
  const { data: session }: any = useSession();
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;

  const [date, setDate] = useState("");
  const [eventName, setEventName] = useState("");
  const [coverImg, setCoverImg] = useState("");
  const [imageFile, setImageFile] = useState([] as any[]);

  const handleUpload = async (option: any) => {
    const file = option?.[0] as any;
    setImageFile([file]);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", "/cover/");

    try {
      const response = await fetch(`${domain}/api/singleImgS3Upload`, {
        method: "POST",
        body: formData,
      }).then((res) => res.json());
      if (response.error) {
        message.error(response.error);
        return;
      } else {
        setCoverImg(response.Location);
      }
    } catch (error) {
      console.log("error", error);
      message.error("上傳失敗");
    }
  };

  const handleUploadEvent = async () => {
    if (!date) return message.error("請選擇日期");
    if (!eventName) return message.error("請輸入活動名稱");
    const userId = session.id;

    const eventData = {
      date,
      eventName,
      coverImg,
      userId,
    };

    await fetch(`${domain}/api/events/add`, {
      method: "POST",
      body: JSON.stringify(eventData),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then(() => {
        message.success("活動新增成功");
        handleOnSuccess();
      })
      .catch((err) => {
        message.error("活動新增失敗");
      });
  };

  const onDateChange: DatePickerProps["onChange"] = (date, dateString) => {
    setDate(dateString as string);
  };

  const onEventNameChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setEventName(e.target.value);
  };

  return (
    <>
      <div className="m-4 text-center">
        <DatePicker onChange={onDateChange} />
        <Input
          placeholder="活動名稱"
          onChange={onEventNameChange}
          className="w-[40%] m-2"
        />
      </div>
      {isShowImageUpload && (
        <div className="mx-auto">
          <Uploader onChange={handleUpload} filesList={imageFile} />
        </div>
      )}
      {imageFile.length > 0 && (
        <div className="flex justify-center">
          <Image
            src={URL.createObjectURL(imageFile[0])}
            width={120}
            height={160}
            alt="預覽封面圖片"
          />
        </div>
      )}
      <div className="text-center my-5">
        {isShowImageUpload ? (
          <Button
            onClick={handleUploadEvent}
            disabled={!Boolean(coverImg && eventName && date)}
            className="bg-white text-[color:var(--main-color-dark)]"
          >
            上傳活動
          </Button>
        ) : (
          //TODO: 這邊待評估是否要改API，如果重複新增賽事怎麼處理
          <Button
            onClick={handleUploadEvent}
            disabled={!Boolean(eventName && date)}
            className="bg-white text-[color:var(--main-color-dark)]"
          >
            提交
          </Button>
        )}
      </div>
    </>
  );
};

export default CreateEventBlock;
