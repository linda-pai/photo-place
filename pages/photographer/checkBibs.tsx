import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Pagination, Radio, Spin } from "antd";
import { ImageItemProps } from "@/types/interfaces/ImageDataProps";
import ImageLightBox from "@/components/image/ImageLightBox";

const AddableTags = dynamic(() => import("@/components/AddableTags"), {
  loading: () => <Spin />,
});

export default function CheckBibs({ eventId }: { eventId: string }) {
  const { data: session }: any = useSession();

  const [images, setImages] = useState([] as ImageItemProps[]);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("pathCount"); //  pathCount or lastModified

  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currImgIndex, setCurrImgIndex] = useState(0); // [0, images.length - 1
  const [curPage, setCurPage] = useState(1);

  const domain = process.env.NEXT_PUBLIC_SERVER_URL;

  useEffect(() => {
    if (!session) return;
    fetch(
      `${domain}/api/images/getByAuthor/${eventId}/${session.id}/${sortBy}?page=${curPage}`
    )
      .then((res) => res.json())
      .then((data) => {
        setImages(data);
      });

    fetch(`${domain}/api/images/getByAuthorCount/${eventId}/${session.id}`)
      .then((res) => res.json())
      .then((data) => setTotal(data.count));
  }, [session, sortBy, curPage]);

  const gotoPrevious = () =>
    currImgIndex > 0 && setCurrImgIndex(currImgIndex - 1);

  const gotoNext = () =>
    currImgIndex + 1 < images.length && setCurrImgIndex(currImgIndex + 1);

  const handleClickImg = (id: string) => {
    setShowImageViewer(true);
    setCurrImgIndex(images.findIndex((item: ImageItemProps) => item.id === id));
  };

  const updateBibs = (newTags: string[], id: string) => {
    if (newTags.length === 0) return;
    fetch(`${domain}/api/images/updateBibs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bibs: newTags, imageId: id, eventId }),
    });
  };

  return (
    <>
      <div className="text-center mt-24 text-[color:var(--main-color-dark)]">
        <p>號碼布檢查</p>
        <p>共 {images.length} 張照片</p>
      </div>
      {images.length > 0 && (
        <div className="container mx-auto sm:my-10 my-4">
          <div className="flex justify-end mx-4">
            <Radio.Group
              defaultValue="pathCount"
              buttonStyle="solid"
              onChange={(e) => setSortBy(e.target.value)}
              className="mb-4"
            >
              <Radio.Button value="pathCount">按號碼布數量排序</Radio.Button>
              <Radio.Button value="lastModified">按時間排序</Radio.Button>
            </Radio.Group>
          </div>
          <div className="masonry">
            {images.map((item: any, key: number) => (
              <div>
                <div
                  className="sm:basis-[calc(20%_-_16px)] basis-[calc(33%_-_16px)] cursor-pointer scale-100 hover:scale-105 transition-all duration-300 group"
                  key={item.id}
                  onClick={() => handleClickImg(item.id)}
                >
                  <Image
                    className="item__content"
                    src={item.watermarkedUrl}
                    alt={item.watermarkedUrl}
                    width={240}
                    height={320}
                    quality={30}
                    style={{ width: "100%", height: "auto" }}
                  />
                </div>
                <AddableTags
                  key={images[key].path}
                  bibs={item.path.map((tag: string) =>
                    tag === "common" ? "" : tag
                  )}
                  handleUpdateBibs={(newTags: string[]) =>
                    updateBibs(newTags, item.id)
                  }
                />
              </div>
            ))}
            <ImageLightBox
              images={images}
              isOpen={showImageViewer}
              curIndex={currImgIndex}
              onClose={() => setShowImageViewer(false)}
              onPrev={gotoPrevious}
              onNext={gotoNext}
              customFooter={
                <div className="absolute bottom-[-20px] left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <AddableTags
                    bibs={images[currImgIndex].path}
                    handleUpdateBibs={(newTags: string[]) =>
                      updateBibs(newTags, images[currImgIndex].id)
                    }
                  />
                </div>
              }
            />
          </div>

          <div className="text-center my-10">
            <Pagination
              defaultCurrent={curPage}
              onChange={setCurPage}
              total={total}
              pageSize={40}
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
