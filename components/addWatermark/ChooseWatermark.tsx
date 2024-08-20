import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  message,
  Row,
  Col,
  Flex,
  Slider,
  InputNumber,
  Segmented,
  Spin,
} from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import { sha256 } from "js-sha256";

const Uploader = dynamic(() => import("@/components/upload/Uploader"), {
  loading: () => <Spin />,
});
const ChooseWatermark = ({ toBeWatermarked, onChange, control }: any) => {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const { data: session }: any = useSession();
  const { position, opacity, watermarkImg } = control;

  const [watermarkImgOption, setWatermarkImgOption] = useState([] as any[]);
  const [imageFile, setImageFile] = useState([] as any[]);

  useEffect(() => {
    if (session && watermarkImgOption.length === 0) handleGetWatermark();
  }, [session]);

  const handleGetWatermark = () => {
    fetch(`${domain}/api/photographer/getWatermark/${session.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + session.id,
        secret: sha256(session.id + process.env.NEXT_PUBLIC_SALT),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          message.error(data.error);
        } else {
          setWatermarkImgOption(data);
          onChange("watermarkImg", data[0]?.watermarkImg);
        }
      });
  };
  const handleUpload = async (option: any) => {
    const file = option[0] as File;
    setImageFile([file]);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", `/watermark/${session.id}/`);

    try {
      const response = await fetch(`${domain}/api/images/singleImgS3Upload`, {
        method: "POST",
        body: formData,
      }).then((res) => res.json());
      if (response.error) {
        message.error(response.error);
        return;
      } else {
        message.success("上傳成功");
        onChange("watermarkImg", response.Location);

        fetch(`${domain}/api/photographer/uploadWatermark`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + session.id,
            secret: sha256(session.id + process.env.NEXT_PUBLIC_SALT),
          },
          body: JSON.stringify({
            watermarkImg: response.Location,
            author: session.id,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.error) {
              message.error(data.error);
            } else {
              message.success("添加浮水印成功");
              handleGetWatermark();
            }
          });
      }
    } catch (error) {}
  };

  const handleDelete = (watermark: string) => {
    fetch(`${domain}/api/photographer/deleteWatermark`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + session.id,
        secret: sha256(session.id + process.env.NEXT_PUBLIC_SALT),
      },
      body: JSON.stringify({
        watermark,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          message.error(data.error);
        } else {
          message.success("刪除成功");
          onChange("watermarkImg", "");
          handleGetWatermark();
        }
      });
  };

  return (
    <Flex
      gap="small"
      align="flex-start"
      vertical
      className="text-[color:var(--main-color-dark)] my-2"
    >
      <Row className="items-center gap-1">
        <p>浮水印：</p>
        <Segmented
          options={watermarkImgOption.map((item: any) => ({
            label: (
              <div className="p-1 group h-[40px] w-[40px]">
                <Image
                  src={item.watermarkImg}
                  width="120"
                  height="20"
                  alt="浮水印"
                  className="object-cover w-full h-full"
                />
                <div
                  className="absolute top-[-15px] right-[-10px] group-hover:bg-opacity-100 cursor-pointer hover:bg-opacity-100 bg-opacity-0 transition-all duration-300 rounded-full"
                  onClick={() => handleDelete(item.watermarkImg)}
                >
                  <CloseCircleOutlined />
                </div>
              </div>
            ),
            value: item.watermarkImg,
          }))}
          onChange={(value) => onChange("watermarkImg", value)}
          defaultValue={watermarkImg}
          key={watermarkImg}
        />
        <div className="mx-4">
          <Uploader onChange={handleUpload} isSimple={true} />
        </div>
      </Row>

      <Row className="items-center">
        <p>透明度：</p>
        <Col span={12}>
          <Slider
            min={10}
            max={100}
            onChange={(value) => onChange("opacity", value)}
            value={typeof opacity === "number" ? opacity : 0}
          />
        </Col>
        <Col span={4}>
          <InputNumber
            min={10}
            max={100}
            style={{ margin: "0 16px" }}
            value={opacity}
            onChange={(value) => onChange("opacity", value)}
          />
        </Col>
      </Row>
      <Row className="items-center">
        <p>位置：</p>
        <Segmented
          options={[
            { label: "左上", value: "northwest" },
            { label: "右下", value: "southeast" },
          ]}
          onChange={(value) => onChange("position", value)}
          defaultValue={position}
        />
      </Row>

      {watermarkImg && (
        <Row className="my-3 w-full">
          <p>預覽：</p>
          <div className="w-full flex justify-center">
            <div className="relative w-[180px] h-[270px]">
              <Image
                src={toBeWatermarked[0]}
                width="180"
                height="270"
                className={`absolute ${
                  position === "northwest" ? "top-0 left-0" : "bottom-0 right-0"
                }`}
                alt="預覽圖片"
              />
              <img
                src={watermarkImg || URL.createObjectURL(imageFile[0])}
                className={`absolute h-[27px] object-contain ${
                  position === "northwest" ? "top-2 left-2" : "bottom-2 right-2"
                }`}
                style={{ opacity: opacity / 100 }}
                alt="預覽圖片"
              />
            </div>
          </div>
        </Row>
      )}
    </Flex>
  );
};

export default ChooseWatermark;
