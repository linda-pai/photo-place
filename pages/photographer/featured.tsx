import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Pagination } from "antd";
import dayjs from "dayjs";
import { ImageItemProps } from "@/types/interfaces/ImageDataProps";
import ImageLightBox from "@/components/image/ImageLightBox";

export default function Featured({ eventId }: { eventId: string }) {
  const { data: session }: any = useSession();

  const [featuredImages, setFeaturedImages] = useState([] as ImageItemProps[]); // [0, images.length - 1

  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currImgIndex, setCurrImgIndex] = useState(0); // [0, images.length - 1
  const [curPage, setCurPage] = useState(1);

  const [totalFeatured, setTotalFeatured] = useState(0);

  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const pageSize = 15;

  useEffect(() => {
    if (!session) return;

    fetch(
      `${domain}/api/images/getFeatured/${eventId}/${session.id}?page=${curPage}`
    )
      .then((res) => res.json())
      .then((data) => {
        setFeaturedImages(data.images);
        setTotalFeatured(data.totalCount);
      });
  }, [session, curPage]);

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

  return (
    <>
      <div className="container mx-auto text-slate-600 my-24 overflow-hidden">
        <h2 className="text-center text-2xl mb-8">精選照片</h2>
        {featuredImages.length > 0 && (
          <div className="container mx-auto sm:my-10 my-4">
            <div className="masonry">
              {featuredImages.map((item: any, key: number) => (
                <div
                  className="sm:basis-[calc(20%_-_16px)] basis-[calc(33%_-_16px)] cursor-pointer scale-100 hover:scale-105 transition-all duration-300 group overflow-hidden relative"
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
          </div>
        )}
      </div>
    </>
  );
}

export async function getServerSideProps(context: any) {
  const eventId = context.query.eventId;

  return {
    props: {
      eventId: eventId || "",
    },
  };
}
