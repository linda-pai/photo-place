import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { setCookie, getCookie } from "cookies-next";
import { useSession } from "next-auth/react";
import { message } from "antd";
import { clickAddToCart, removeAddToCart } from "@/lib/gtag";
import ImageItems from "./ImageItems";
import ImageLightBox from "./ImageLightBox";

const CustomImgViewerUI = dynamic(() => import("./CustomImgViewerUI"), {
  ssr: false,
});

interface ImageItemProps {
  eventId: string;
  eventName: string;
  id: string;
  watermarkedUrl: string;
}

const ImageList = ({
  images,
  isOpen,
  curIndex,
  onClose,
  onPrev,
  onNext,
  handleClickImg,
  eventId,
  eventName,
}: {
  images: ImageItemProps[];
  isOpen: boolean;
  curIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  handleClickImg?: (id: string) => void;
  eventId: string;
  eventName: string;
}) => {
  const { data: session }: any = useSession();
  const [cartData, setCartData] = useState({} as any);

  useEffect(() => {
    setCartData(JSON.parse(getCookie("cart") || "{}"));
  }, []);
  const isExistInCart = (id: string) => cartData[eventId]?.includes(id);

  const pushToCart = (id: string) => {
    const currentCart = JSON.parse(getCookie("cart") || "{}");
    if (currentCart[eventId]?.includes(id)) return;
    const newCart = currentCart[eventId] ? [...currentCart[eventId], id] : [id];
    currentCart[eventId] = newCart;
    updateCart(currentCart);
  };

  const updateCart = (data: any) => {
    setCookie("cart", JSON.stringify(data), {
      expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    });

    setCartData(data);
  };

  const handleClickCart = (id: string) => {
    const currentCart = JSON.parse(getCookie("cart") || "{}");
    //check if cart exist
    if (!isExistInCart(id)) {
      //存入cookie
      pushToCart(id);
      message.success("已加入購物車");

      //埋點
      clickAddToCart({
        event_category: "event",
        event_label: eventName,
        image_id: id,
        user_id: session.id,
      });
    } else {
      //從cookie移除
      const newCart = currentCart[eventId].filter(
        (item: string) => item !== id
      );
      currentCart[eventId] = newCart;
      updateCart(currentCart);
      message.success("已從購物車移除");

      //埋點
      removeAddToCart({
        event_category: "event",
        event_label: eventName,
        image_id: id,
        user_id: session.id,
      });
    }
  };

  return (
    <div className="masonry">
      {images.map((item: any, key: number) => (
        <ImageItems
          key={key}
          item={item}
          isExistInCart={isExistInCart}
          handleClickCart={handleClickCart}
          handleClickImg={handleClickImg}
        />
      ))}
      <ImageLightBox
        images={images}
        isOpen={isOpen}
        curIndex={curIndex}
        onClose={onClose}
        onPrev={onPrev}
        onNext={onNext}
        customFooter={
          <CustomImgViewerUI
            image={images[curIndex]}
            isExistInCart={isExistInCart}
            handleClickCart={handleClickCart}
          />
        }
      />
    </div>
  );
};

export default ImageList;
