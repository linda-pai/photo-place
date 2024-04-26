import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Pagination } from "antd";
import dayjs from "dayjs";
import { ImageItemProps } from "@/types/interfaces/ImageDataProps";
import ImageLightBox from "@/components/image/ImageLightBox";

export default function UploadPreview({ eventId }: { eventId: string }) {
  const { data: session }: any = useSession();

  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currImgIndex, setCurrImgIndex] = useState(0); // [0, images.length - 1
  const [curPage, setCurPage] = useState(1);
  const [allImagesCount, setAllImagesCount] = useState(0);
  const [allImages, setAllImages] = useState([] as ImageItemProps[]);

  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const pageSize = 24;

  useEffect(() => {
    if (!session) return;
    fetch(
      `${domain}/api/images/getByAuthor/${eventId}/${session.id}/lastModified?page=${curPage}`
    )
      .then((res) => res.json())
      .then((data) => {
        setAllImages(data.images);
        setAllImagesCount(data.totalCount);
      });
  }, [session, curPage]);

  const gotoPrevious = () =>
    currImgIndex > 0 && setCurrImgIndex(currImgIndex - 1);

  const gotoNext = () =>
    currImgIndex + 1 < allImages.length && setCurrImgIndex(currImgIndex + 1);

  const handleClickImg = (id: string) => {
    setShowImageViewer(true);
    setCurrImgIndex(
      allImages.findIndex((item: ImageItemProps) => item.id === id)
    );
  };

  return (
    <>
      {allImages.length > 0 && (
        <div className="container mx-auto sm:my-10 my-4">
          <div className="masonry">
            {allImages.map((item: any, key: number) => (
              <div
                className="masonry-item h-fit cursor-pointer scale-100 hover:scale-105 transition-all duration-300 group"
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
              images={allImages}
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
              total={allImagesCount}
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
