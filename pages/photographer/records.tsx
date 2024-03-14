import React from "react";
import { Spin } from "antd";
import useAuth from "@/hooks/useAuth";
import dynamic from "next/dynamic";

const RecordOfUploadProps = dynamic(() => import("@/components/records"), {
  loading: () => <Spin />,
});
const records = () => {
  const isLogin = useAuth();

  return isLogin ? (
    <div className="container mx-auto text-slate-600 my-24 overflow-hidden">
      <h1 className="text-center text-2xl mb-8">攝影師上傳紀錄</h1>
      <RecordOfUploadProps />
    </div>
  ) : (
    <Spin className="mx-auto my-[40vh] w-full" size="large" />
  );
};

export default records;
