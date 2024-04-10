import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Pagination } from "antd";
import dayjs from "dayjs";
import { ImageItemProps } from "@/types/interfaces/ImageDataProps";
import ImageLightBox from "@/components/image/ImageLightBox";

export default function UploadPreview({
  eventId,
  toggle,
}: {
  eventId: string;
  toggle: any;
}) {
  const { data: session }: any = useSession();

  const [releasedImages, setReleasedImages] = useState([] as ImageItemProps[]);
  const [unReleasedImages, setUnReleasedImages] = useState(
    [] as ImageItemProps[]
  );
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currImgIndex, setCurrImgIndex] = useState(0); // [0, images.length - 1
  const [curPage, setCurPage] = useState(1);
  const [totalReleased, setTotalReleased] = useState(0);
  const [totalUnReleased, setTotalUnReleased] = useState(0);

  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const pageSize = 15;

  useEffect(() => {
    if (!session) return;
    fetch(
      `${domain}/api/images/getByAuthor/${eventId}/${session.id}/lastModified?isReleased=true&page=${curPage}`
    )
      .then((res) => res.json())
      .then((data) => {
        setReleasedImages(data.images);
        setTotalReleased(data.totalCount);
      });

    fetch(
      `${domain}/api/images/getByAuthor/${eventId}/${session.id}/lastModified?isReleased=false&page=${curPage}`
    )
      .then((res) => res.json())
      .then((data) => {
        setUnReleasedImages(data.images);
        setTotalUnReleased(data.totalCount);
      });
  }, [session, curPage]);

  const gotoPrevious = () =>
    currImgIndex > 0 && setCurrImgIndex(currImgIndex - 1);

  const gotoNext = () =>
    currImgIndex + 1 < releasedImages.length &&
    setCurrImgIndex(currImgIndex + 1);

  const handleClickImg = (id: string) => {
    setShowImageViewer(true);
    setCurrImgIndex(
      releasedImages.findIndex((item: ImageItemProps) => item.id === id)
    );
  };

  return (
    <>
      {releasedImages.length > 0 && toggle["RELEASED"] && (
        <div className="text-center mt-24 text-[color:var(--main-color-dark)]">
          <div className="container mx-auto sm:my-10 my-4">
            <div className="masonry">
              {releasedImages.map((item: any, key: number) => (
                <div
                  className="sm:basis-[calc(20%_-_16px)] basis-[calc(33%_-_16px)] cursor-pointer scale-100 hover:scale-105 transition-all duration-300 group"
                  key={item.id}
                  onClick={() => handleClickImg(item.id)}
                >
                  <Image
                    className="item__content"
                    src={item.watermarkedUrl}
                    alt={item.watermarkedUrl}
                    width={300}
                    height={400}
                    quality={30}
                  />
                  <div className="absolute bottom-0 text-start text-sm text-[color:var(--main-color-dark)] p-1 bg-[#fff] bg-opacity-70">
                    <p>{item.fileName}</p>
                    <p>{dayjs(item.lastModified).format("YYYY/MM/DD HH:mm")}</p>
                  </div>
                </div>
              ))}
              <ImageLightBox
                images={releasedImages}
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
                total={totalReleased}
                pageSize={pageSize}
                showSizeChanger={false}
                current={curPage}
              />
            </div>
          </div>
        </div>
      )}

      {unReleasedImages.length > 0 && toggle["UNRELEASED"] && (
        <div className="container mx-auto sm:my-10 my-4">
          <div className="masonry">
            {unReleasedImages.map((item: any, key: number) => (
              <div
                className="sm:basis-[calc(20%_-_16px)] basis-[calc(33%_-_16px)] cursor-pointer scale-100 hover:scale-105 transition-all duration-300 group"
                key={item.id}
                onClick={() => handleClickImg(item.id)}
              >
                <Image
                  className="item__content"
                  src={item.watermarkedUrl}
                  alt={item.watermarkedUrl}
                  width={300}
                  height={400}
                  quality={30}
                />
              </div>
            ))}
            <ImageLightBox
              images={unReleasedImages}
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
              total={totalUnReleased}
              pageSize={pageSize}
              showSizeChanger={false}
              current={curPage}
            />
          </div>
        </div>
      )}
    </>
  );
}
