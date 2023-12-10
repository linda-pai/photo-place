import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import { useEffect, useState, useRef } from "react";
import { message, Button } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import ImgsViewer from "react-images-viewer";
import { setCookie, getCookie } from "cookies-next";
import scrollIntoViewWithOffset from "@/utils/scrollIntoViewWithOffset";
// https://guonanci.github.io/react-images-viewer/
import dynamic from "next/dynamic";
import Head from "next/head";
// import Image from "next/image";

const SearchWrapper = dynamic(
  () => import("@/pages/components/SearchWrapper"),
  {
    ssr: false,
  }
);

// Post component
export default function EventSearchPage({
  eventInfo,
  imageList,
  navBarRef,
}: any) {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const [search, setSearch] = useState("");
  const [images, setImages] = useState([] as any);
  const [showModal, setShowModal] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currImg, setCurrImg] = useState(0); // [0, images.length - 1
  const [cartData, setCartData] = useState({} as any);

  //id as evetId
  const { eventId, eventName, coverImg } = eventInfo;

  useEffect(() => {
    setImages(imageList);
    setCartData(JSON.parse(getCookie("cart") || "{}"));
  }, []);

  const handleOnChange = (e: any) => {
    setSearch(e.target.value.trim());
  };

  const onSearch = () => {
    if (search.match(/^[0-9]+$/) == null)
      return message.error("請輸入正確的號碼布");

    fetch(`${domain}/api/images/getByBidAndEventId/${eventId}/${search}`)
      .then((res) => res.json())
      .then((data) => {
        setImages(data);
        setShowModal(true);

        scrollIntoViewWithOffset(".masonry", 220);
      });
  };

  const handleClickImg = (id: string) => {
    setShowImageViewer(true);
    setCurrImg(images.findIndex((item: any) => item.id === id));
  };

  const updateCart = (data: any) => {
    setCookie("cart", JSON.stringify(data), {
      expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    });

    setCartData(data);
  };

  const isExistInCart = (id: string) => cartData[eventId]?.includes(id);

  const handleClickCart = (id: string) => {
    const currentCart = JSON.parse(getCookie("cart") || "{}");
    //check if cart exist
    if (!isExistInCart(id)) {
      //存入cookie
      pushToCart(id);
      message.success("已加入購物車");
    } else {
      //從cookie移除
      const newCart = currentCart[eventId].filter(
        (item: string) => item !== id
      );
      currentCart[eventId] = newCart;
      updateCart(currentCart);
      message.success("已從購物車移除");
    }
  };

  // const handleAddToFavorite = (id: string) => {};

  const viewerImgArray = images.map((image: any, key: number) => {
    return {
      src: image.watermarkedUrl,
      caption: (
        <div className="flex gap-4">
          <button
            onClick={() => handleClickCart(image.id)}
            className="cursor-pointer"
          >
            <ShoppingCartOutlined
              className={`text-[32px] ${
                isExistInCart(image.id)
                  ? "text-[color:var(--main-color)]"
                  : "text-white"
              }`}
            />
          </button>
        </div>
      ),
    };
  });

  const flatted = viewerImgArray.flat();

  const pushToCart = (id: string) => {
    const currentCart = JSON.parse(getCookie("cart") || "{}");
    const newCart = currentCart[eventId] ? [...currentCart[eventId], id] : [id];
    currentCart[eventId] = newCart;
    updateCart(currentCart);
  };

  const ImageItems = ({ watermarkedUrl, id }: any) => (
    <div
      className="sm:basis-[calc(20%_-_16px)] basis-[calc(33%_-_16px)] cursor-pointer scale-100 hover:scale-105 transition-all duration-300"
      key={id}
      onClick={() => handleClickImg(id)}
    >
      <img
        className="item__content"
        src={watermarkedUrl}
        alt={watermarkedUrl}
        // width={300}
        // height={400}
        // quality={70}
      />
    </div>
  );
  return (
    <>
      <Head>
        <title>{eventName} | 搜尋照片</title>
        <meta property="og:title" content={`${eventName} | 搜尋照片`} />
        <meta name="description" content={`${eventName} | 號碼布搜尋照片`} />
        <meta
          property="og:description"
          content={`${eventName} | 號碼布搜尋照片`}
        />
        <meta property="og:image" content={coverImg} />
        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_APP_URL}/events/${eventId}`}
        />
      </Head>
      <div ref={navBarRef}>
        <SearchWrapper
          handleOnChange={handleOnChange}
          onSearch={onSearch}
          eventName={eventName}
        />
      </div>
      <div className="container mx-auto my-10">
        <div className="text-center m-10 text-[color:var(--main-color-dark)]">
          <p>試營運期間，只有一位攝影師🥲</p>
          {
            <p className={showModal ? "visible" : "invisible h-0"}>{`找到 ${
              images.length
            } 張照片，${
              images.length == 0
                ? "我們未來會努力的增加攝影師的💪"
                : "太有緣份了！"
            }`}</p>
          }
          <p>不囉唆⚡全面 65 折優惠</p>
        </div>

        <div className="masonry min-h-[50vh]">
          {images.map((item: any) => ImageItems(item))}
          <ImgsViewer
            imgs={flatted}
            isOpen={showImageViewer}
            currImg={currImg}
            onClickPrev={() => setCurrImg((prev) => prev - 1)}
            onClickNext={() => setCurrImg((prev) => prev + 1)}
            onClose={() => setShowImageViewer(false)}
            onClickThumbnail={(index: number) => setCurrImg(index)}
            showThumbnails={true}
          />
        </div>
        <div>
          {images.length > 0 && search && (
            <Button
              onClick={() => {
                pushToCart(images.map((item: any) => item.id));
                message.success(`已將 ${images.length} 張照片加入購物車`);
              }}
              className="mx-auto block my-10"
            >
              全部加入購物車
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(context: any) {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const eventId = context.params.id;

  const imageList = await fetch(
    `${domain}/api/images/getByEventId/${eventId}`
  ).then((res) => res.json());

  const eventInfo = await fetch(`${domain}/api/events/getBy/${eventId}`).then(
    (res) => res.json()
  );

  return { props: { imageList, eventInfo } };
}
