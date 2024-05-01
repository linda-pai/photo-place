import React, { useState } from "react";
import { Spin } from "antd";
import dynamic from "next/dynamic";

const ImageLightBox = dynamic(
  () => import("@/components/image/ImageLightBox"),
  {
    loading: () => <Spin />,
  }
);

const ImageDetail = ({
  isOpen,
  onClose,
  images,
  currImg,
  handleClickImg,
}: {
  isOpen: boolean;
  onClose: () => void;
  images: any;
  currImg: number;
  handleClickImg: () => void;
}) => {
  const [currImgIndex, setCurrImgIndex] = useState(currImg); // [0, images.length - 1

  const gotoPrevious = () =>
    currImgIndex > 0 && setCurrImgIndex(currImgIndex - 1);

  const gotoNext = (images: any) => {
    currImgIndex + 1 < images.length && setCurrImgIndex(currImgIndex + 1);
  };

  return (
    <div>
      <div className="flex gap-8 items-center hover:cursor-pointer">
        <p className="text-end">共 {images ? images?.length : 0} 張</p>
      </div>
      <div className="flex gap-2 overflow-scroll mt-2">
        {images.map((item: any, key: number) => (
          <div key={key} onClick={handleClickImg}>
            <img
              className="w-20 cursor-pointer"
              src={item.watermarkedUrl}
              alt={item.watermarkedUrl}
            />
          </div>
        ))}
      </div>

      <ImageLightBox
        images={images}
        isOpen={isOpen}
        curIndex={currImgIndex}
        onClose={onClose}
        onPrev={gotoPrevious}
        onNext={() => gotoNext(images)}
        customFooter={null}
      />
    </div>
  );
};

export default ImageDetail;
