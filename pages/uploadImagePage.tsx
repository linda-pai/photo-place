import React, { useState } from "react";
import type { UploadProps } from "antd";
import { message, Spin } from "antd";
import userPermission from "@/hooks/usePermission";

import dynamic from "next/dynamic";

const Uploader = dynamic(() => import("@/pages/components/Uploader"), {
  loading: () => <Spin />,
});
const UploadImagePage: React.FC = () => {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const isAllowed = userPermission();

  const [coverImg, setCoverImg] = useState("");

  const handleUpload = async (option: any) => {
    const file = option.file as File;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", "/common/");

    try {
      const response = await fetch(`${domain}/api/singleImgS3Upload`, {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          setCoverImg(data.Location);
          return data.Location;
        });

      option.onSuccess(response.Location);
    } catch (error) {
      option.onError(error);
    }
  };

  const props: UploadProps = {
    name: "file",
    multiple: true,
    maxCount: 1,
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
    onRemove() {
      setCoverImg("");
    },
  };

  return isAllowed ? (
    <div className="container mx-auto h-[100vh] flex flex-col justify-center">
      <div className="mx-auto">
        <Uploader {...props} />
      </div>
      {coverImg && (
        <img
          src={coverImg}
          // width="300"
          // height="300"
          className="mx-auto my-5"
          alt="封面圖片"
        />
      )}
    </div>
  ) : (
    <Spin className="mx-auto my-[40vh] w-full" size="large" />
  );
};

export default UploadImagePage;
