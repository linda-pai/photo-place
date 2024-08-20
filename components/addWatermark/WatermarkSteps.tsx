import React, { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Steps, Button, message, Spin } from "antd";
import {
  LeftOutlined,
  RightOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import dynamic from "next/dynamic";
import { sha256 } from "js-sha256";
import downloadImage from "@/utils/downloadImage";

const ChooseWatermark = dynamic(
  () => import("@/components/addWatermark/ChooseWatermark"),
  {
    loading: () => <Spin />,
  }
);

const WatermarkSteps = ({
  toBeWatermarked,
  handleRemoveWatermarkedImg,
  eventId,
}: {
  toBeWatermarked: any[];
  handleRemoveWatermarkedImg: (item: any) => void;
  eventId: string;
}) => {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const { data: session }: any = useSession();

  const [current, setCurrent] = useState(0);
  const [watermarkImg, setWatermarkImg] = useState("");
  const [position, setPosition] = useState("southeast"); // southeast or northwest
  const [opacity, setOpacity] = useState(100);
  const [disabledDownload, setDisabledDownload] = useState(true);
  const [loading, setLoading] = useState(false);

  const onChange = (label: string, value: any) => {
    switch (label) {
      case "opacity":
        setOpacity(value);
        break;

      case "position":
        setPosition(value === "northwest" ? "northwest" : "southeast");
        break;

      case "watermarkImg":
        setWatermarkImg(value);
        break;
    }
  };

  const handleWatermarkDownload = async () => {
    const loadingMsgConfig = {
      key: "loading",
      content: "下載中...",
    };
    message.open({ ...loadingMsgConfig, type: "loading" });

    const getImageDownloadInfo = async () => {
      return await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/photographer/getFeaturedWatermarkImages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + session.id,
            secret: sha256(session.id + process.env.NEXT_PUBLIC_SALT),
          },
          body: JSON.stringify({ imageList: toBeWatermarked, eventId }),
        }
      )
        .then((res) => res.json())
        .then((result) => {
          message.success("下載成功");
          message.destroy("loading");
          handleRemoveWatermarkedImg(toBeWatermarked);
          setDisabledDownload(true);
          setCurrent(0);
          return result;
        })
        .catch((err) => {
          message.error("下載失敗");
          message.destroy("loading");
        });
    };

    const imageList = await getImageDownloadInfo();

    const url = `${
      process.env.NEXT_PUBLIC_APP_URL
    }/api/imageZip?imageList=${JSON.stringify(imageList)}`;

    downloadImage(url);
  };

  const generateWatermark = (position: string, opacity: number) => {
    if (!watermarkImg) return;
    const loadingMsgConfig = {
      key: "loading",
      content: "處理中...",
    };

    setLoading(true);
    message.open({ ...loadingMsgConfig, type: "loading" });

    fetch(`${domain}/api/photographer/generateWatermark`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + session.id,
        secret: sha256(session.id + process.env.NEXT_PUBLIC_SALT),
      },
      body: JSON.stringify({
        images: toBeWatermarked,
        watermarkImg,
        position,
        opacity,
        eventId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          message.error(data.error);
        } else {
          message.success("添加浮水印成功");
          message.destroy("loading");
          setDisabledDownload(false);
          setLoading(false);
          //   removeFromWatermark();
        }
      });
  };

  const steps = [
    {
      title: "選擇照片",
      content: (
        <div className="flex flex-wrap justify-center gap-2 my-8">
          {toBeWatermarked?.map((item: any, key: number) => (
            <div className="relative" key={key}>
              <Image
                src={item}
                alt={item}
                width={90}
                height={90}
                quality={30}
              />
              <div className="absolute top-[-6px] right-[-6px]">
                <div
                  onClick={() => handleRemoveWatermarkedImg(item)}
                  className="flex items-center text-2xl text-white bg-red-400 rounded-full cursor-pointer hover:bg-red-600"
                >
                  <MinusCircleOutlined />
                </div>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "浮水印樣式",
      content: (
        <ChooseWatermark
          toBeWatermarked={toBeWatermarked}
          onChange={onChange}
          control={{ position, opacity, watermarkImg }}
        />
      ),
    },
    {
      title: "下載",
      content: (
        <div className="flex justify-center gap-2 my-10">
          <Button
            className=""
            onClick={() => generateWatermark(position, opacity)}
            loading={loading}
          >
            產生浮水印
          </Button>
          <Button
            onClick={handleWatermarkDownload}
            type="primary"
            disabled={disabledDownload}
          >
            下載
          </Button>
        </div>
      ),
    },
  ];

  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  return (
    <>
      <Steps current={current} size="small" className="mb-4" items={steps} />
      <div>{steps[current].content}</div>
      <div className="mt-1 flex justify-center gap-1">
        <Button
          onClick={() => prev()}
          className="flex items-center"
          disabled={current === 0}
        >
          <LeftOutlined />
        </Button>

        <Button
          type="primary"
          onClick={() => next()}
          className="flex items-center"
          disabled={current === steps.length - 1}
        >
          <RightOutlined />
        </Button>
      </div>
    </>
  );
};

export default WatermarkSteps;
