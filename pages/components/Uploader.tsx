import React from "react";
import { useDropzone } from "react-dropzone";
import { Progress } from "antd";
import { UploadOutlined, FileImageOutlined } from "@ant-design/icons";

interface UploaderProps {
  onChange: (files: File[]) => void;
  fileOptionsList: File[];
  loading: boolean;
}
const Uploader = ({ onChange, fileOptionsList, loading }: UploaderProps) => {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles: any) => onChange(acceptedFiles),
    disabled: loading,
  });

  return (
    <div className="max-w-[550px] mx-auto my-10 text-center">
      <div
        {...getRootProps()}
        className={`${
          loading
            ? "hover:cursor-not-allowed bg-[#FFF] text-[color:var(--main-color-light)]"
            : "hover:cursor-pointer bg-[#FFFDFB] text-[color:var(--main-color-dark)]"
        } my-10 border-2 border-dashed border-[color:var(--main-color-light)] rounded-2xl p-10`}
      >
        <input {...getInputProps()} />
        <UploadOutlined className="text-3xl mb-4" />
        <p>上傳照片 - 從檔案選擇或拖曳</p>
      </div>
      <ul>
        {fileOptionsList.map((file: any, key: number) => (
          <div
            className="flex items-center text-[color:var(--main-color-dark)]"
            key={key}
          >
            <FileImageOutlined />
            <li className="mx-4" key={file.name}>
              {file.name}
            </li>
            <Progress percent={file.progress} />
          </div>
        ))}
      </ul>
    </div>
  );
};
export default Uploader;
