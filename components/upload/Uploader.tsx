import React from "react";
import { useDropzone } from "react-dropzone";
import { UploadOutlined } from "@ant-design/icons";

interface UploaderProps {
  onChange: (files: File[]) => void;
  filesList?: File[];
  loading?: boolean;
}
const Uploader = ({ onChange, filesList, loading }: UploaderProps) => {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles: any) => onChange(acceptedFiles),
    //TODO:  disabled: loading,
  });

  return (
    <div className="max-w-[550px] mx-auto my-10 text-center">
      <div
        {...getRootProps()}
        className={`${
          loading
            ? //TODO:  ? "hover:cursor-not-allowed bg-[#FFF] text-[color:var(--main-color-light)]"
              "bg-[#FFF] text-[color:var(--main-color-light)]"
            : "hover:cursor-pointer bg-[#FFFDFB] text-[color:var(--main-color-dark)]"
        } my-10 border-2 border-dashed border-[color:var(--main-color-light)] rounded-2xl p-10`}
      >
        <input {...getInputProps()} />
        <UploadOutlined className="text-3xl mb-4" />
        <p>上傳照片 - 從檔案選擇或拖曳</p>
      </div>
    </div>
  );
};
export default Uploader;
