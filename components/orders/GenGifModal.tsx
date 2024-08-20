import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Modal, Select, message, Button, Tooltip, Spin, Result } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import { sha256 } from "js-sha256";
import generateGif from "@/utils/generateGif";
import downloadImage from "@/utils/downloadImage";

const GenGifModal = ({
  isModalOpen,
  handleCancel,
}: {
  isModalOpen: boolean;
  handleCancel: () => void;
}) => {
  const [eventId, setEventId] = useState("");
  const [events, setEvents] = useState([] as any);
  const [orientation, setOrientation] = useState("");
  const [orderImages, setOrderImages] = useState([] as any);
  const [selectableImages, setSelectableImages] = useState([] as any);
  const [selected, setSelected] = useState([] as any);
  const [loading, setLoading] = useState(false);
  const [gif, setGif] = useState("");

  const { data: session }: any = useSession();

  useEffect(() => {
    fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/orders/eventListByUserOrder`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + session.id,
          secret: sha256(session.id + process.env.NEXT_PUBLIC_SALT),
        },
        body: JSON.stringify({ userId: session.id }),
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setEvents(data.events);
          setOrderImages(data.images);
        } else {
          message.error(data.message);
        }
      });
  }, []);

  useEffect(() => {
    //get images by orders eventId and orientation
    const ids = orderImages
      .filter((img: any) => img.eventId === eventId)
      .map((img: any) => img.imageId);
    if (!ids.length) return;
    if (eventId && orientation) {
      fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/images/getByIds/${eventId}/${ids}`
      )
        .then((res) => res.json())
        .then((data) => {
          const images = data.filter(
            (img: any) => img.orientation === orientation
          );
          setSelectableImages(images);
          setSelected(images.map((img: any) => img.id));
        });
    }
  }, [eventId, orientation]);

  const handleOnChangeEvent = (value: string) => {
    setEventId(value);
  };

  const handleOnChangeOrientation = (value: string) => {
    setOrientation(value);
  };

  const handleGenerateGif = async (imageIdList: string[]) => {
    setLoading(true);
    try {
      const res = await generateGif(imageIdList, eventId, session.id);
      if (res.status === "success") {
        setGif(res.gif);
      } else {
        message.error(res.message);
      }
      setLoading(false);
    } catch {
      message.error("下載失敗");
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-end mb-4 mr-4 gap-1">
      <Modal
        title="製作GIF動圖"
        footer={null}
        open={isModalOpen}
        onCancel={handleCancel}
      >
        {loading ? (
          <div className="my-[20vh]">
            <Spin className="mx-auto w-full mb-2" size="large" />
            <p className="text-center mt-4 text-[color:var(--main-color-dark)]">
              正在生成 GIF 中 ...
            </p>
          </div>
        ) : (
          <>
            {gif ? (
              <Result
                status="success"
                title="GIF 已生成完成!"
                subTitle="點擊下載按鈕下載您的GIF動圖"
                extra={[
                  <div className="my-4 flex justify-center">
                    <Image
                      src={gif}
                      alt={gif}
                      width={200}
                      height={200}
                      className=" hover:cursor-pointer"
                      onClick={() => downloadImage(gif)}
                    />
                  </div>,
                ]}
              />
            ) : (
              <>
                <div className="text-[color:var(--main-color-dark)] my-2">
                  <p>如果您相同賽事購買多張的照片，可以製作成GIF動圖</p>
                  <p>連拍照片會有最佳效果！</p>
                </div>
                {/* 下拉選擇賽事 */}
                <div className="my-2">
                  <div className="w-full">
                    <Select
                      options={[
                        ...events.map((event: any) => ({
                          label: event.eventName,
                          value: event.eventId,
                        })),
                      ]}
                      onChange={handleOnChangeEvent}
                      placeholder="請選擇賽事"
                      value={eventId || undefined}
                      className="w-[80%] my-1"
                    />
                  </div>
                  {/* 下拉選擇直向or橫向照片 */}
                  <div className="w-full">
                    <Select
                      options={[
                        { label: "直向", value: "vertical" },
                        { label: "橫向", value: "horizontal" },
                      ]}
                      placeholder="請選擇照片方向"
                      className="w-[80%] my-1"
                      onChange={handleOnChangeOrientation}
                      value={orientation || undefined}
                    />
                  </div>
                </div>

                {/* 下拉選擇GIF速度 */}

                {eventId && orientation && (
                  <div className="flex flex-wrap gap-2">
                    {selectableImages.map((img: any, key: number) => (
                      <div
                        className="relative hover:cursor-pointer  "
                        key={key}
                        onClick={() => {
                          setSelected((prev: any) => {
                            if (prev.includes(img.id)) {
                              return prev.filter(
                                (item: any) => item !== img.id
                              );
                            } else {
                              return [...prev, img.id];
                            }
                          });
                        }}
                      >
                        {/* mask */}
                        <div
                          className={`${
                            selected.includes(img.id)
                              ? "absolute top-0 left-0 w-full h-full bg-black opacity-30"
                              : ""
                          }`}
                        ></div>

                        <Image
                          src={img.watermarkedUrl}
                          alt={img.watermarkedUrl}
                          width={100}
                          height={100}
                          quality={30}
                        />
                        <div
                          className={`absolute top-0 left-0 w-full h-full flex justify-center items-center ${
                            selected.includes(img.id)
                              ? "block text-[color:var(--main-color)] text-2xl"
                              : "hidden"
                          }`}
                        >
                          <CheckCircleOutlined />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-1">
                  {/* 生成GIF按鈕 */}
                  <Tooltip title="需選擇一張照片以上" placement="bottom">
                    <Button
                      className="my-4"
                      onClick={() => handleGenerateGif(selected)}
                      disabled={
                        !eventId || !orientation || selected.length <= 1
                      }
                    >
                      生成GIF
                    </Button>
                  </Tooltip>
                </div>
              </>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default GenGifModal;
