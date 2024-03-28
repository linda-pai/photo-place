// /components/NextBreadcrumb.tsx
import React from "react";
import { useRouter } from "next/router";
import { usePathname } from "next/navigation";
import { Breadcrumb } from "antd";

const UploadBreadcrumb = () => {
  const paths = usePathname();
  const pathNames = paths.split("/").filter((path) => path);
  const router = useRouter();

  const pathNamesTitleMap: any = {
    uploadService: {
      title: "上傳服務說明",
      path: "/uploadService",
    },
    chooseEvent: {
      title: "選擇活動",
      path: "/uploadService/chooseEvent",
    },
    upload: {
      title: "上傳照片",
      path: "/uploadService/chooseEvent/upload",
    },
  };

  const items = pathNames.map((link) => {
    return {
      key: link,
      title: pathNamesTitleMap?.[link].title || link,
      path: `${pathNamesTitleMap?.[link].path}` || link,
      onClick: () => {
        router.push(`${pathNamesTitleMap?.[link].path}`);
      },
    };
  });

  const homeItem = {
    title: "首頁",
    path: "/",
    onClick: () => {
      router.push("/");
    },
  };

  return (
    <div>
      {pathNames.length > 0 && (
        <Breadcrumb separator=">" items={[homeItem, ...items]} />
      )}
    </div>
  );
};

export default UploadBreadcrumb;
