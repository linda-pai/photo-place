import React, { useState } from "react";
import Image from "next/image";
import { message, Spin } from "antd";
import userPermission from "@/hooks/usePermission";
import copyToClipboard from "@/utils/copyToClipboard";

import dynamic from "next/dynamic";

const Uploader = dynamic(() => import("@/components/Uploader"), {
  loading: () => <Spin />,
});
const UploadImagePage: React.FC = () => {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const isAllowed = userPermission();

  const [coverImg, setCoverImg] = useState("");
  const [imageFile, setImageFile] = useState([] as any[]);

  const handleUpload = async (option: any) => {
    const file = option[0] as File;
    setImageFile([file]);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", "/common/");

    try {
      const response = await fetch(`${domain}/api/singleImgS3Upload`, {
        method: "POST",
        body: formData,
      }).then((res) => res.json());
      if (response.error) {
        message.error(response.error);
        return;
      } else {
        message.success("上傳成功");
        setCoverImg(response.Location);
      }
    } catch (error) {}
  };

  return isAllowed ? (
    <div className="container mx-auto h-[100vh] flex flex-col justify-center">
      <div className="mx-auto">
        <Uploader onChange={handleUpload} filesList={imageFile} />
      </div>
      {coverImg && (
        <>
          <Image
            src={URL.createObjectURL(imageFile[0])}
            width="120"
            height="160"
            className="mx-auto my-5"
            alt="預覽圖片"
          />
          <p
            className="underline text-[#4285f4]"
            onClick={() => copyToClipboard(coverImg)}
          >
            {coverImg}
          </p>
        </>
      )}
    </div>
  ) : (
    <Spin className="mx-auto my-[40vh] w-full" size="large" />
  );
};

export default UploadImagePage;
