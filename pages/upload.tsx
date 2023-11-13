import React, { useState } from "react";
import type { UploadProps } from "antd";
import { message, Select, Spin } from "antd";
import Uploader from "@/pages/components/Uploader";
import { getCookie } from "cookies-next";
import userPermission from "@/hooks/userPermission";

interface Event {
  id: number;
  date: string;
  eventName: string;
}

const UploadPage: React.FC<{ eventOption: Event[] }> = ({ eventOption }) => {
  const isAllowed = userPermission();

  const [eventId, setEventId] = useState("");

  const handleSelected = (value: string) => {
    setEventId(value);
  };

  const handleUpload = async (option: any) => {
    const file = option.file as File;
    const userId = getCookie("userId");

    try {
      if (!userId) return message.error("請先登入");
      if (!eventId) return message.error("請選擇活動");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("eventId", eventId);
      formData.append("author", userId);

      const response = await fetch(
        "http://localhost:3001/api/images/uploadAndDetectText",
        {
          method: "POST",
          body: formData,
        }
      ).then((res) => res.json());

      console.log("response", response);

      option.onSuccess(response.url);
    } catch (error) {
      option.onError(error);
    }
  };

  const props: UploadProps = {
    name: "file",
    multiple: true,
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
  };

  return isAllowed ? (
    <>
      <div className="m-4 flex justify-center">
        <Select
          placeholder="請選擇活動"
          className="w-1/3 "
          onChange={handleSelected}
          options={eventOption.map((event: any) => ({
            label: event.date + "-" + event.eventName,
            value: event.id,
          }))}
        />
      </div>
      <div className="mx-auto max-w-[800px]">
        <Uploader {...props} />
      </div>
    </>
  ) : (
    <Spin className="mx-auto my-[40vh] w-full" size="large" />
  );
};

export async function getServerSideProps(context: any) {
  // Fetch data from external API
  const res = await fetch("http://localhost:3001/api/events/getEventOptions");
  const eventOption = await res.json();

  // Pass data to the page via props
  return { props: { eventOption } };
}

export default UploadPage;
