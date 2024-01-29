import dynamic from "next/dynamic";
import Lightbox from "react-spring-lightbox";
import { ArrowRightOutlined, ArrowLeftOutlined } from "@ant-design/icons";

const CustomImgViewerUI = dynamic(() => import("./CustomImgViewerUI"), {
  ssr: false,
});

const ImageLightBox = ({
  images,
  isExistInCart,
  handleClickCart,
  isOpen,
  curIndex,
  onClose,
  onPrev,
  onNext,
}: {
  images: any[];
  isExistInCart?: any;
  handleClickCart?: any;
  isOpen: boolean;
  curIndex: number;
  onClose: any;
  onPrev: any;
  onNext: any;
}) => {
  const formattedImages = images.map((image) => ({
    src: image.watermarkedUrl,
    alt: image.watermarkedUrl,
  }));

  return (
    <Lightbox
      isOpen={isOpen}
      images={formattedImages}
      currentIndex={curIndex}
      onClose={onClose}
      onPrev={onPrev}
      onNext={onNext}
      renderPrevButton={() => (
        <div
          onClick={onPrev}
          className={`z-50 text-white text-4xl sm:p-20 p-1 hover:text-[color:var(--main-color)] ${
            curIndex === 0
              ? "opacity-20 hover:cursor-not-allowed"
              : "hover:cursor-pointer"
          }`}
        >
          <ArrowLeftOutlined />
        </div>
      )}
      renderNextButton={() => (
        <div
          onClick={onNext}
          className={`z-50 text-white text-4xl sm:p-20 p-1 hover:text-[color:var(--main-color)]  ${
            curIndex === images.length - 1
              ? "opacity-20 hover:cursor-not-allowed"
              : "hover:cursor-pointer"
          }`}
        >
          <ArrowRightOutlined />
        </div>
      )}
      renderFooter={() =>
        isExistInCart && (
          <CustomImgViewerUI
            image={images[curIndex]}
            isExistInCart={isExistInCart}
            handleClickCart={handleClickCart}
          />
        )
      }
      className="bg-opacity-80 bg-black"
    />
  );
};

export default ImageLightBox;
