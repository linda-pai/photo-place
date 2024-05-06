import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Head from "next/head";
import Link from "next/link";
import { Pagination, Spin, Button, Empty } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { ImageItemProps } from "@/types/interfaces/ImageDataProps";
import ImageLightBox from "@/components/image/ImageLightBox";
import userPermission from "@/hooks/usePermission";
import removeImg from "@/lib/removed/removeImg";
import { DETECTING_IMG } from "@/constants";

export default function Removed({
  eventId,
  date,
}: {
  eventId: string;
  date: string;
}) {
  const title = "已移除照片 - " + process.env.NEXT_PUBLIC_APP_NAME;
  const isAllowed = userPermission();

  const { data: session }: any = useSession();

  const [removedImages, setRemovedImages] = useState([] as ImageItemProps[]); // [0, images.length - 1

  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currImgIndex, setCurrImgIndex] = useState(0); // [0, images.length - 1
  const [curPage, setCurPage] = useState(1);

  const [totalRemoved, setTotalRemoved] = useState(0);

  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const pageSize = 24;

  useEffect(() => {
    if (!session) return;

    fetch(
      `${domain}/api/photographer/getByStatus/${eventId}/${session.id}?page=${curPage}&status=removed`
    )
      .then((res) => res.json())
      .then((data) => {
        setRemovedImages(data.images);
        setTotalRemoved(data.totalCount);
      });
  }, [session, curPage]);

  const gotoPrevious = () =>
    currImgIndex > 0 && setCurrImgIndex(currImgIndex - 1);

  const gotoNext = () =>
    currImgIndex + 1 < removedImages.length &&
    setCurrImgIndex(currImgIndex + 1);

  const handleClickImg = (id: string) => {
    setShowImageViewer(true);
    setCurrImgIndex(
      removedImages.findIndex((item: ImageItemProps) => item.id === id)
    );
  };

  const handleRemovedImg = (id: string, isRemoved: boolean, e: any) => {
    if (!session) return;
    e.stopPropagation();

    removeImg({
      eventId,
      id,
      author: session.id,
      isRemoved,
    }).then((data) => {
      if (data.status === "success") {
        const updatedImages = removedImages.map((item) => {
          if (item.id === id) {
            item.isRemoved = !isRemoved;
          }
          return item;
        });
        setRemovedImages(updatedImages);
      }
    });
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="已移除照片" />
        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_APP_URL}/photographer/featured`}
        />
      </Head>

      {isAllowed ? (
        <>
          <div className="container mx-auto text-slate-600 my-24 overflow-hidden">
            <h2 className="text-center text-2xl mb-8">已移除照片</h2>

            <div className="container mx-auto sm:my-10 my-4">
              <Link
                href={`/photographer/checkBibs?eventId=${eventId}&date=${date}`}
                className={`mx-2 my-2 flex ${
                  removedImages.length > 0 ? "justify-start" : "justify-center"
                }`}
              >
                <Button type="primary">編輯相簿</Button>
              </Link>
              {removedImages.length > 0 ? (
                <>
                  <div className="masonry">
                    {removedImages.map((item: any, key: number) => (
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
                        />
                        <div className="flex gap-2 py-2 px-1 justify-end items-center bg-[#404040] bg-opacity-40 absolute top-0 w-full group hover:bg-opacity-80 transition-all duration-300">
                          <Button
                            onClick={(e) =>
                              handleRemovedImg(item.id, item.isRemoved, e)
                            }
                            className={`flex items-center justify-center mr-1 ${
                              item.isRemoved
                                ? "text-white border border-[#fff] bg-[#ef4444]"
                                : "text-white border border-white bg-transparent"
                            }`}
                            size="small"
                          >
                            <DeleteOutlined />
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
                      images={removedImages}
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
                      total={totalRemoved}
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
