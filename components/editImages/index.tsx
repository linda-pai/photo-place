import React, { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Button, Empty, Spin, message } from "antd";
import { DeleteOutlined, StarOutlined } from "@ant-design/icons";
import { ImageItemProps } from "@/types/interfaces/ImageDataProps";
import ImageLightBox from "@/components/image/ImageLightBox";
import { DETECTING_IMG } from "@/constants";
import AddableTags from "@/components/AddableTags";
import { sha256 } from "js-sha256";
import { featureImg, deleteImg } from "@/lib/editImages";

interface EditBibsProps {
  images: ImageItemProps[];
  setImages: React.Dispatch<React.SetStateAction<ImageItemProps[]>>;
  eventId: string;
  loading: boolean;
}

const EditImages = ({ images, setImages, eventId, loading }: EditBibsProps) => {
  const { data: session }: any = useSession();

  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currImgIndex, setCurrImgIndex] = useState(0); // [0, images.length - 1

  const domain = process.env.NEXT_PUBLIC_SERVER_URL;

  const memoImages = useMemo(() => images, [images]);

  const gotoPrevious = () =>
    currImgIndex > 0 && setCurrImgIndex(currImgIndex - 1);

  const gotoNext = () =>
    currImgIndex + 1 < memoImages.length && setCurrImgIndex(currImgIndex + 1);

  const handleClickImg = (id: string) => {
    setShowImageViewer(true);
    setCurrImgIndex(
      memoImages.findIndex((item: ImageItemProps) => item.id === id)
    );
  };

  const handleFeatureImg = (id: string, isFeatured: boolean, e: any) => {
    e.stopPropagation();

    featureImg({
      eventId,
      id,
      isFeatured,
      session,
    }).then((data) => {
      if (data.status === "success") {
        setImages((prev) =>
          prev.map((item) => {
            if (item.id === id) {
              return { ...item, isFeatured: !item.isFeatured };
            }
            return item;
          })
        );
      }
    });
  };

  const handleDeleteImg = (id: string, isRemoved: boolean, e: any) => {
    e.stopPropagation();

    deleteImg({
      eventId,
      id,
      isRemoved,
      session,
    }).then((data: any) => {
      if (data.status === "success") {
        setImages((prev) =>
          prev.map((item) => {
            if (item.id === id) {
              return { ...item, isRemoved: !item.isRemoved };
            }
            return item;
          })
        );
      } else {
        message.error("刪除失敗");
      }
    });
  };

  const updateBibs = (newTags: string[], id: string) => {
    fetch(`${domain}/api/photographer/updateBibs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + session.id,
        secret: sha256(session.id + process.env.NEXT_PUBLIC_SALT),
      },
      body: JSON.stringify({ bibs: newTags, imageId: id, eventId }),
    });

    setImages((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, path: newTags };
        }
        return item;
      })
    );
  };

  return memoImages.length !== 0 ? (
    <>
      <div className="masonry">
        {!loading ? (
          memoImages.map((item: any, key: number) => (
            <div
              key={key}
              className={`${`masonry-item-${item.orientation}`} relative masonry-item h-fit cursor-pointer scale-100 hover:scale-105 transition-all duration-300 group`}
              onClick={() => handleClickImg(item.id)}
            >
              <Image
                className="w-full h-auto"
                src={item.watermarkedUrl || DETECTING_IMG}
                alt={item.watermarkedUrl || DETECTING_IMG}
                width="0"
                height="0"
                sizes="100vw"
                quality={30}
              />
              <div className="flex gap-2 py-2 px-1 justify-between items-center bg-[#404040] bg-opacity-40 absolute top-0 w-full  group hover:bg-opacity-80 transition-all duration-300">
                <p className="w-[60%] text-white ml-1 text-sm break-words">
                  {item.fileName}
                </p>
                <div className="w-[40%] flex justify-end">
                  <Button
                    onClick={(e) => handleDeleteImg(item.id, item.isRemoved, e)}
                    className={`flex items-center justify-center mr-1 ${
                      item.isRemoved
                        ? "text-white border border-[#fff] bg-[#ef4444]"
                        : "text-white border border-white bg-transparent"
                    }`}
                    size="small"
                  >
                    <DeleteOutlined />
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
                  >
                    <StarOutlined />
                  </Button>
                </div>
              </div>
              <div className="absolute bottom-0">
                <AddableTags
                  key={memoImages[key].path}
                  bibs={item.path.map((tag: string) =>
                    tag === "common" ? "" : tag
                  )}
                  handleUpdateBibs={(newTags: string[]) =>
                    updateBibs(newTags, item.id)
                  }
                />
              </div>
            </div>
          ))
        ) : (
          <Spin className="mx-auto my-[40vh] w-full" size="large" />
        )}

        <ImageLightBox
          images={memoImages}
          isOpen={showImageViewer}
          curIndex={currImgIndex}
          onClose={() => setShowImageViewer(false)}
          onPrev={gotoPrevious}
          onNext={gotoNext}
          customFooter={
            <div className="absolute bottom-[-20px] left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <AddableTags
                bibs={memoImages[currImgIndex].path}
                handleUpdateBibs={(newTags: string[]) =>
                  updateBibs(newTags, memoImages[currImgIndex].id)
                }
                key={memoImages[currImgIndex].path}
              />
            </div>
          }
        />
      </div>
    </>
  ) : (
    <div className="text-center my-10">
      {loading ? (
        <Spin className="mx-auto my-[40vh] w-full" size="large" />
      ) : (
        <Empty />
      )}
    </div>
  );
};

export default EditImages;
