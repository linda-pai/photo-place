import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { setCookie, getCookie } from "cookies-next";
import { useSession } from "next-auth/react";
import { message, Modal } from "antd";
import { clickAddToCart, removeAddToCart } from "@/lib/gtag";
import ImageItems from "./ImageItems";
import ImageLightBox from "./ImageLightBox";
import { REPORT_TYPE } from "@/constants";

const CustomImgViewerUI = dynamic(
  () => import("@/components/image/CustomImgViewerUI"),
  {
    ssr: false,
  }
);

const ReportForm = dynamic(() => import("@/components/image/ReportForm"), {
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
  onLoad,
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
  onLoad: () => void;
}) => {
  const { data: session }: any = useSession();
  const router = useRouter();
  const [cartData, setCartData] = useState({} as any);
  const [modal, contextHolder] = Modal.useModal();
  const [reportType, setReportType] = useState<typeof REPORT_TYPE>();

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
        user_id_number: String(session?.id) || "",
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
        user_id_number: String(session?.id) || "",
      });
    }
  };

  const handleClickReport = (id: string) => {
    //檢查是否登入
    if (!session) {
      return router.push(
        `${process.env.NEXT_PUBLIC_APP_URL}/auth/signIn?previousUrl=${router.asPath}`
      );
    }
    modal.confirm({
      title: "檢舉",
      content: <ReportForm setReportType={setReportType} />,
      onOk() {
        //fetch api
        fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/user/reportImage`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            eventId,
            imageId: id,
            reportType,
            reporterId: session.id,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.status === "success") {
              message.success("檢舉成功，我們將盡快進行審核");
              router.reload();
            } else {
              message.error(data.message || "檢舉失敗");
            }
          });
      },
      onCancel() {},
    });
  };

  return (
    <div className="masonry">
      {images?.map((item: any, key: number) => (
        <ImageItems
          key={key}
          item={item}
          isExistInCart={isExistInCart}
          handleClickCart={handleClickCart}
          handleClickImg={handleClickImg}
          onLoad={onLoad}
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
            handleClickReport={handleClickReport}
          />
        }
      />
      {contextHolder}
    </div>
  );
};

export default ImageList;
