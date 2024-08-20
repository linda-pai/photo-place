import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Head from "next/head";
import Link from "next/link";
import { setCookie, getCookie } from "cookies-next";
import { Pagination, Spin, Button, Empty, message } from "antd";
import { StarOutlined, BgColorsOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { sha256 } from "js-sha256";
import { ImageItemProps } from "@/types/interfaces/ImageDataProps";
import userPermission from "@/hooks/usePermission";
import { featureImg } from "@/lib/editImages";
import dynamic from "next/dynamic";
import { DETECTING_IMG, REMOVE_IMAGE_STATUS } from "@/constants";

const WatermarkModal = dynamic(
  () => import("@/components/addWatermark/WatermarkModal"),
  {
    loading: () => <Spin />,
  }
);

const ImageLightBox = dynamic(
  () => import("@/components/image/ImageLightBox"),
  {
    loading: () => <Spin />,
  }
);

export default function Featured({
  eventId,
  date,
}: {
  eventId: string;
  date: string;
}) {
  const title = "精選照片 - " + process.env.NEXT_PUBLIC_APP_NAME;
  const isAllowed = userPermission();

  const { data: session }: any = useSession();

  const [featuredImages, setFeaturedImages] = useState([] as ImageItemProps[]); // [0, images.length - 1

  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currImgIndex, setCurrImgIndex] = useState(0); // [0, images.length - 1
  const [curPage, setCurPage] = useState(1);

  const [totalFeatured, setTotalFeatured] = useState(0);
  const [toBeWatermarked, setToBeWatermarked] = useState({} as any);

  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const pageSize = 24;

  useEffect(() => {
    if (!session) return;

    fetch(
      `${domain}/api/photographer/getByStatus/${eventId}/${session.id}?page=${curPage}&status=${REMOVE_IMAGE_STATUS.FEATURED}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + session.id,
          secret: sha256(session.id + process.env.NEXT_PUBLIC_SALT),
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        setFeaturedImages(data.images);
        setTotalFeatured(data.totalCount);
      });
  }, [session, curPage]);

  useEffect(() => {
    setToBeWatermarked(JSON.parse(getCookie("watermarked") || "{}"));
  }, []);

  const gotoPrevious = () =>
    currImgIndex > 0 && setCurrImgIndex(currImgIndex - 1);

  const gotoNext = () =>
    currImgIndex + 1 < featuredImages.length &&
    setCurrImgIndex(currImgIndex + 1);

  const handleClickImg = (id: string) => {
    setShowImageViewer(true);
    setCurrImgIndex(
      featuredImages.findIndex((item: ImageItemProps) => item.id === id)
    );
  };

  const handleFeatureImg = (id: string, isFeatured: boolean, e: any) => {
    if (!session) return;
    e.stopPropagation();

    featureImg({
      eventId,
      id,
      isFeatured,
      author: session.id,
    }).then((data) => {
      if (data.status === "success") {
        const updatedImages = featuredImages.map((item) => {
          if (item.id === id) {
            item.isFeatured = !isFeatured;
          }
          return item;
        });
        setFeaturedImages(updatedImages);
      }
    });
  };

  const updateWatermarkImg = (data: any) => {
    setCookie("watermarked", JSON.stringify(data), {
      expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    });

    setToBeWatermarked(data);
  };

  const pushToCookie = (id: string) => {
    const currentCookie = JSON.parse(getCookie("watermarked") || "{}");
    if (currentCookie[eventId]?.includes(id)) return;
    const newCookie = currentCookie[eventId]
      ? [...currentCookie[eventId], id]
      : [id];

    currentCookie[eventId] = newCookie;
    updateWatermarkImg(currentCookie);
  };

  const isExistInWatermark = (watermarkedUrl: string) =>
    toBeWatermarked[eventId]?.includes(watermarkedUrl);

  const handleToBeWatermarkedImg = (
    isWatermarked: boolean,
    watermarkedUrl: string
  ) => {
    if (!isExistInWatermark(watermarkedUrl)) {
      //max 20 images
      if (toBeWatermarked[eventId]?.length >= 20 && !isWatermarked) {
        return message.error("最多只能選擇20張照片");
      }
      //存入cookie
      pushToCookie(watermarkedUrl);
      message.success("已加入浮水印清單");
    } else {
      //寫入cookie
      const currentWatermarked = JSON.parse(getCookie("watermarked") || "{}");
      //從cookie移除
      const newCookie = currentWatermarked[eventId].filter(
        (item: string) => item !== watermarkedUrl
      );
      currentWatermarked[eventId] = newCookie;
      updateWatermarkImg(currentWatermarked);
      message.success("已從浮水印清單移除");
    }
  };

  const handleRemoveWatermarkedImg = (items: string[]) => {
    const currentWatermarked = JSON.parse(getCookie("watermarked") || "{}");
    const newCookie = currentWatermarked[eventId].filter(
      (cookie: string) => !items.includes(cookie)
    );
    currentWatermarked[eventId] = newCookie;
    updateWatermarkImg(currentWatermarked);
  };

  const customLoader = ({ src, width, height, quality }: any) => {
    return `${src}?w=${width}&h=${height}&q=${quality || 75}`;
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="精選照片" />
        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_APP_URL}/photographer/featured`}
        />
      </Head>

      {isAllowed ? (
        <>
          <div className="container mx-auto text-slate-600 my-24 overflow-hidden">
            <h2 className="text-center text-2xl mb-8">精選照片</h2>
            <div className="container mx-auto sm:my-10 my-4">
              <WatermarkModal
                eventId={eventId}
                toBeWatermarked={toBeWatermarked[eventId]}
                handleRemoveWatermarkedImg={handleRemoveWatermarkedImg}
              />
              <Link
                href={`/photographer/checkBibs?eventId=${eventId}&date=${date}`}
                className={`mx-2 my-2 flex ${
                  featuredImages.length > 0 ? "justify-start" : "justify-center"
                }`}
              >
                <Button type="primary">編輯相簿</Button>
              </Link>
              {featuredImages.length > 0 ? (
                <>
                  <div className="masonry">
                    {featuredImages.map((item: any, key: number) => (
                      <div
                        className={`${`masonry-item-${item.orientation}`} masonry-item h-fit cursor-pointer scale-100 hover:scale-105 transition-all duration-300 group overflow-hidden relative`}
                        key={item.id}
                        onClick={() => handleClickImg(item.id)}
                      >
                        <Image
                          src={item.watermarkedUrl || DETECTING_IMG}
                          alt={item.watermarkedUrl || DETECTING_IMG}
                          width={300}
                          height={400}
                          quality={30}
                          loading="lazy"
                          loader={customLoader}
                        />
                        <div className="flex gap-2 py-2 px-1 justify-end items-center bg-[#404040] bg-opacity-40 absolute top-0 w-full group hover:bg-opacity-80 transition-all duration-300">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToBeWatermarkedImg(
                                item.isWatermarked,
                                item.watermarkedUrl
                              );
                            }}
                            className={`flex items-center justify-center mr-1 ${
                              isExistInWatermark(item.watermarkedUrl)
                                ? "text-white border border-[#fff] bg-[#f97316] text-[#fff]"
                                : "text-white bg-[#fff] border border-white bg-transparent"
                            }`}
                            size="small"
                            title="加浮水印"
                          >
                            <BgColorsOutlined />
                          </Button>

                          <Button
                            onClick={(e) =>
                              handleFeatureImg(item.id, item.isFeatured, e)
                            }
                            className={`flex items-center justify-center mr-1 ${
                              item.isFeatured
                                ? "text-white border border-[#fff] bg-[color:var(--main-color)] text-[#fff]"
                                : "text-white bg-[#fff] border border-white bg-transparent"
                            }`}
                            size="small"
                            title="精選"
                          >
                            <StarOutlined />
                          </Button>
                        </div>
                        <div className="absolute bottom-0 text-start text-sm text-[color:var(--main-color-dark)] p-1 bg-[#fff] bg-opacity-70">
                          <p>{item.fileName}</p>
                          <p>
                            {dayjs(item.lastModified).format(
                              "YYYY/MM/DD HH:mm"
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                    <ImageLightBox
                      images={featuredImages}
                      isOpen={showImageViewer}
                      curIndex={currImgIndex}
                      onClose={() => setShowImageViewer(false)}
                      onPrev={gotoPrevious}
                      onNext={gotoNext}
                      customFooter={null}
                    />
                  </div>
                  <div className="text-center my-10">
                    <Pagination
                      defaultCurrent={curPage}
                      onChange={setCurPage}
                      total={totalFeatured}
                      pageSize={pageSize}
                      showSizeChanger={false}
                      current={curPage}
                    />
                  </div>
                </>
              ) : (
                <Empty />
              )}
            </div>
          </div>
        </>
      ) : (
        <Spin className="mx-auto my-[40vh] w-full" size="large" />
      )}
    </>
  );
}

export async function getServerSideProps(context: any) {
  const eventId = context.query.eventId;
  const date = context.query.date;

  return {
    props: {
      eventId: eventId || "",
      date: date || "",
    },
  };
}
