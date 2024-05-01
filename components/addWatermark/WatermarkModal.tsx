import { useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Modal, Segmented, Flex, Avatar, Spin, message, Button } from "antd";
import dynamic from "next/dynamic";
import downloadImage from "@/utils/downloadImage";
import { ImageItemProps } from "@/types/interfaces/ImageDataProps";

const Uploader = dynamic(() => import("@/components/upload/Uploader"), {
  loading: () => <Spin />,
});

const WatermarkModal = ({
  featuredImages,
  eventId,
}: {
  featuredImages: ImageItemProps[];
  eventId: string;
}) => {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const { data: session }: any = useSession();

  const [watermarkImgOption, setWatermarkImgOption] = useState([] as any[]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [watermarkImg, setWatermarkImg] = useState("");
  const [imageFile, setImageFile] = useState([] as any[]);
  const [position, setPosition] = useState("southeast");

  const handleAddWatermark = () => {
    fetch(`${domain}/api/photographer/getWatermark/${session.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          message.error(data.error);
        } else {
          setWatermarkImgOption(data);
        }
      });
    setModalOpen(true);
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
        setWatermarkImg(response.Location);
        fetch(`${domain}/api/photographer/watermark`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
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
            }
          });
      }
    } catch (error) {}
  };

  const handleWatermarkDownload = async () => {
    const loadingMsgConfig = {
      key: "loading",
      content: "下載中...",
    };
    message.open({ ...loadingMsgConfig, type: "loading" });

    const getImageDownloadInfo = async () => {
      return await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/photographer/getFeaturedWatermarkImages/${eventId}/${session.id}`
      )
        .then((res) => res.json())
        .then((result) => {
          message.success("下載成功");
          message.destroy("loading");
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

  const onClickOk = () => {
    if (!watermarkImg) return;
    const loadingMsgConfig = {
      key: "loading",
      content: "處理中...",
    };
    message.open({ ...loadingMsgConfig, type: "loading" });

    fetch(`${domain}/api/photographer/addFeaturedImageWatermark`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        images: featuredImages,
        watermarkImg,
        position,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          message.error(data.error);
        } else {
          message.success("添加浮水印成功");
          message.destroy("loading");
        }
      });
  };

  return (
    <div className="flex justify-end mb-4 mr-2 gap-1">
      <Button onClick={handleAddWatermark}>添加浮水印</Button>
      <Button onClick={handleWatermarkDownload}>下載浮水印照片</Button>
      <Modal
        title="添加浮水印"
        onOk={onClickOk}
        onCancel={() => setModalOpen((prev) => !prev)}
        open={isModalOpen}
      >
        <p>選擇浮水印</p>
        <Uploader onChange={handleUpload} filesList={imageFile} />
        {watermarkImg && (
          <>
            <div className="flex justify-center">
              <div className="w-[120px] h-[200px]">
                <Image
                  src={featuredImages[0].watermarkedUrl}
                  width="120"
                  height="160"
                  className=" absolute bottom-32"
                  alt="預覽圖片"
                />
                <Image
                  src={watermarkImg || URL.createObjectURL(imageFile[0])}
                  width="120"
                  height="160"
                  className=" absolute bottom-32"
                  alt="預覽圖片"
                />
              </div>
            </div>
          </>
        )}
        <Flex gap="small" align="flex-start" vertical>
          <Segmented
            options={watermarkImgOption.map((item: any) => ({
              label: (
                <div>
                  <Avatar src={item.watermarkImg} />
                </div>
              ),
              value: item.watermarkImg,
            }))}
            onChange={(value) => setWatermarkImg(value)}
          />
          <Segmented
            options={[
              { label: "左上", value: "northwest" },
              { label: "右下", value: "southeast" },
            ]}
            onChange={(value) => setPosition(value)}
          />
        </Flex>
      </Modal>
    </div>
  );
};

export default WatermarkModal;
