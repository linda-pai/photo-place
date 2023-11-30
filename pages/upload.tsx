import React, { useState } from "react";
import type { UploadProps } from "antd";
import { message, Select, Spin } from "antd";
import { getCookie } from "cookies-next";
import userPermission from "@/hooks/userPermission";
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
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const isAllowed = userPermission();

  const [eventId, setEventId] = useState({} as SelectOption);

  const handleSelected = (obj: SelectOption) =>
    setEventId({ value: obj.value, label: obj.label });

  const handleUpload = async (option: any) => {
    const file = option.file as File;
    const userId = getCookie("userId");

    try {
      if (!userId) return message.error("請先登入");
      if (!eventId) return message.error("請選擇活動");
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
            value: event.id,
          }))}
        />
      </div>
      <div className="mx-auto max-w-[800px] min-h-[30vh]">
        <Uploader {...props} />
      </div>
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
