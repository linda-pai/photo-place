import React from "react";
import { useDropzone } from "react-dropzone";
import { UploadOutlined } from "@ant-design/icons";

interface UploaderProps {
  onChange: (files: File[]) => void;
  filesList?: File[];
  loading?: boolean;
  isSimple?: boolean;
}
const Uploader = ({
  onChange,
  filesList,
  loading,
  isSimple = false,
}: UploaderProps) => {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles: any) => onChange(acceptedFiles),
    disabled: loading,
  });

  return (
    <div
      {...getRootProps()}
      className={`${
        loading
          ? "hover:cursor-not-allowed bg-[#FFF] text-[color:var(--main-color-light)]"
          : "hover:cursor-pointer bg-[#FFFDFB] text-[color:var(--main-color-dark)]"
      } border-2 border-dashed border-[color:var(--main-color-light)] rounded-lg ${
        isSimple ? "p-[5px]" : "p-10"
      }`}
    >
      <input {...getInputProps()} />
      <UploadOutlined className={`${isSimple ? "text-lg" : "text-3xl"}`} />
      {!isSimple ? (
        <p className="mt-4">上傳照片 - 從檔案選擇或拖曳</p>
      ) : (
        <span className="mx-1">新增浮水印</span>
      )}
    </div>
  );
};
export default Uploader;
