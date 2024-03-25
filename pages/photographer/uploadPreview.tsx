//TODO:  已經改成component了 ，可以刪掉

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Pagination } from "antd";
import { ImageItemProps } from "@/types/interfaces/ImageDataProps";
import ImageLightBox from "@/components/image/ImageLightBox";

export default function UploadPreview({ eventId }: { eventId: string }) {
  const { data: session }: any = useSession();

  const [releasedImages, setReleasedImages] = useState([] as ImageItemProps[]);
  const [unReleasedImages, setUnReleasedImages] = useState(
    [] as ImageItemProps[]
  );
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currImgIndex, setCurrImgIndex] = useState(0); // [0, images.length - 1
  const [curPage, setCurPage] = useState(1);

  const domain = process.env.NEXT_PUBLIC_SERVER_URL;

  const pageSize = 15;

  useEffect(() => {
    session &&
      fetch(
        `${domain}/api/images/getByAuthor/${eventId}/${session.id}/lastModified`
      )
        .then((res) => res.json())
        .then((data) => {
          const releasedImages = data.filter(
            (item: any) => item.isReleased === true
          );
          const unReleasedImages = data.filter(
            (item: any) => item.isReleased === false
          );

          setReleasedImages(releasedImages);
          setUnReleasedImages(unReleasedImages);
        });
  }, [session]);

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
      <div className="text-center mt-24 text-[color:var(--main-color-dark)]">
        <p>releasedImages</p>
        <p>共 {releasedImages.length} 張照片</p>
      </div>
      {releasedImages.length > 0 && (
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
              total={releasedImages.length}
              pageSize={pageSize}
              showSizeChanger={false}
              current={curPage}
            />
          </div>
        </div>
      )}
      {unReleasedImages.length > 0 && (
        <div className="container mx-auto sm:my-10 my-4">
          <div className="text-center mt-24 text-[color:var(--main-color-dark)]">
            <p>unReleasedImages</p>
            <p>共 {unReleasedImages.length} 張照片</p>
          </div>

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
              total={unReleasedImages.length}
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

export async function getServerSideProps(context: any) {
  const eventId = context.query.eventId;

  return {
    props: {
      eventId,
    },
  };
}
