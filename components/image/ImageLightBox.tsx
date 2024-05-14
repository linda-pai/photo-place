import Lightbox from "react-spring-lightbox";
import { ArrowRightOutlined, ArrowLeftOutlined } from "@ant-design/icons";

const ImageLightBox = ({
  images,
  isOpen,
  curIndex,
  onClose,
  onPrev,
  onNext,
  customFooter,
}: {
  images: any[];
  isOpen: boolean;
  curIndex: number;
  onClose: any;
  onPrev: any;
  onNext: any;
  customFooter: any;
}) => {
  const formattedImages = images.map((image) => ({
    src: image.watermarkedUrl,
    alt: image.watermarkedUrl,
  }));

  return (
    <div onContextMenu={(e) => e.preventDefault()}>
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
        renderFooter={() => customFooter}
        className="bg-opacity-80 bg-black overflow-hidden"
      />
    </div>
  );
};

export default ImageLightBox;
