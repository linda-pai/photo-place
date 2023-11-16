import React, { useState } from "react";
import type { UploadProps, DatePickerProps } from "antd";
import { message, DatePicker, Input, Button, Spin } from "antd";
import Uploader from "@/pages/components/Uploader";
import { useRouter } from "next/router";
import userPermission from "@/hooks/userPermission";

const CreateEventPage: React.FC = () => {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const isAllowed = userPermission();

  const [date, setDate] = useState("");
  const [eventName, setEventName] = useState("");
  const [coverImg, setCoverImg] = useState("");

  const router = useRouter();

  const handleUpload = async (option: any) => {
    const file = option.file as File;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${domain}/api/singleImgS3Upload`, {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("data", data);
          setCoverImg(data.Location);
          return data.Location;
        });

      option.onSuccess(response.Location);
    } catch (error) {
      option.onError(error);
    }
  };

  const handleUploadEvent = async () => {
    if (!date) return message.error("請選擇日期");
    if (!eventName) return message.error("請輸入活動名稱");
    const userId = JSON.parse(sessionStorage.getItem("userInfo") || "{}").id;

    const eventData = {
      date,
      eventName,
      coverImg,
      userId,
    };

    const response = await fetch(`${domain}/api/events/add`, {
      method: "POST",
      body: JSON.stringify(eventData),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then(() => {
        message.success("活動新增成功");
        router.push("/");
      });

    console.log("response", response);
    setCoverImg("");
  };

  const props: UploadProps = {
    name: "file",
    multiple: true,
    maxCount: 1,
    customRequest: handleUpload,
    onChange(info) {
      const { status } = info.file;
      if (status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (status === "done") {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
    onRemove() {
      setCoverImg("");
    },
  };

  const onDateChange: DatePickerProps["onChange"] = (date, dateString) => {
    setDate(dateString);
  };

  const onEventNameChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    console.log(e.target.value);
    setEventName(e.target.value);
  };

  return isAllowed ? (
    <div className="container mx-auto h-[100vh] flex flex-col justify-center">
      <div className="m-4 text-center">
        <DatePicker onChange={onDateChange} />
        <Input
          placeholder="活動名稱"
          onChange={onEventNameChange}
          className="w-[40%] m-2"
        />
      </div>
      <div className="mx-auto">
        <Uploader {...props} />
      </div>
      {coverImg && (
        <img src={coverImg} width="300" height="300" className="mx-auto my-5" />
      )}
      <div className="text-center my-5">
        <Button
          onClick={handleUploadEvent}
          disabled={!Boolean(coverImg && eventName && date)}
          className="bg-white text-white"
        >
          上傳活動
        </Button>
      </div>
    </div>
  ) : (
    <Spin className="mx-auto my-[40vh] w-full" size="large" />
  );
};

export default CreateEventPage;
