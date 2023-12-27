import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import { useEffect, useState, useRef } from "react";
import { message, Button, Tag, Spin } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import ImgsViewer from "react-images-viewer";
import { setCookie, getCookie } from "cookies-next";
import scrollIntoViewWithOffset from "@/utils/scrollIntoViewWithOffset";
// https://guonanci.github.io/react-images-viewer/
import dynamic from "next/dynamic";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";

const SearchWrapper = dynamic(
  () => import("@/pages/components/SearchWrapper"),
  {
    loading: () => <Spin />,
  }
);

// Post component
export default function EventSearchPage({
  eventInfo,
  imageList,
  commonImages,
  navBarRef,
  bib,
}: any) {
  const router = useRouter();

  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const [search, setSearch] = useState(bib || "");
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

  useEffect(() => {
    onSearch();
  }, []);

  const handleOnChange = (e: any) => {
    setSearch(e.target.value.trim());
  };

  const onSearch = () => {
    if (search !== "" && search.match(/^[0-9]+$/) == null)
      return message.error("請輸入正確的號碼布");

    // //set url query
    router.push(
      {
        pathname: `/events/${eventId}`,
        query: { bib: search },
      },
      undefined,
      { shallow: true }
    );
    if (search === "") return setImages(imageList);
    fetch(`${domain}/api/images/getByBidAndEventId/${eventId}/${search}`)
      .then((res) => res.json())
      .then((data) => {
        setImages(data);
        setShowModal(true);

        scrollIntoViewWithOffset(".masonry", 180);
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
              className={`text-[24px] ${
                isExistInCart(image.id)
                  ? "text-[color:var(--main-color)]"
                  : "text-white"
              }`}
            />
            <p
              className={`text-xs ${
                isExistInCart(image.id)
                  ? "text-[color:var(--main-color)]"
                  : "text-white"
              }`}
            >
              {isExistInCart(image.id) ? "已加入購物車" : "加入購物車"}
            </p>
          </button>
          <div>
            <p className="line-through text-xs text-[#8f8f8f]">TWD: 169</p>
            <p className="text-red-500 ">TWD: 109 </p>
          </div>
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
      <Image
        className="item__content"
        src={watermarkedUrl}
        alt={watermarkedUrl}
        width={300}
        height={400}
        quality={20}
      />
      <div
        className="bg-[#5f5b50] opacity-70 absolute bottom-0 w-full sm:h-[10%] h-[18%] min-h-[28px] max-h-[34px] group hover:opacity-90 transition-all duration-300"
        onClick={(e) => {
          e.stopPropagation();
          handleClickCart(id);
          console.log("");
        }}
      >
        <div
          className={`z-20 text-xl absolute bottom-[20%] justify-center flex items-center w-full hover:cursor-pointer group-hover:text-[color:var(--main-color)] ${
            isExistInCart(id) ? "text-[color:var(--main-color)]" : "text-white"
          }`}
        >
          <ShoppingCartOutlined />
          <p className="sm:text-sm  md:block hidden ml-1 h-fit">
            {isExistInCart(id) ? "已加入購物車" : "加入購物車"}
          </p>
        </div>
      </div>
    </div>
  );
  return (
    <>
      <Head>
        <title>{`${eventName} | 搜尋照片`}</title>
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
            <p
              className={showModal && search ? "visible" : "invisible h-0"}
            >{`找到 ${images.length} 張照片，${
              images.length == 0
                ? "我們未來會努力的增加攝影師的💪"
                : "太有緣份了！"
            }`}</p>
          }
          <p>不囉唆⚡全面 65 折優惠</p>
        </div>

        {images.length > 0 && (
          <>
            <div className="my-2 mx-3 text-[color:var(--main-color-dark)] text-sm">
              <Tag color="#B0B97A">已完成辨識號碼布</Tag>
            </div>
            <div className="masonry">
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
          </>
        )}

        {commonImages && commonImages.length > 0 && !search && (
          <>
            <div className="my-2 mt-16 mb-4 text-[color:var(--main-color-dark)] text-sm">
              <Tag>未成功辨識號碼布</Tag>
            </div>
            <div className="masonry">
              {commonImages.map((item: any) => ImageItems(item))}
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
          </>
        )}
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
  const bib = context.query.bib || "";

  const imageList = await fetch(
    `${domain}/api/images/getByEventId/${eventId}`
  ).then((res) => res.json());

  const eventInfo = await fetch(`${domain}/api/events/getBy/${eventId}`).then(
    (res) => res.json()
  );

  const commonImages = await fetch(
    `${domain}/api/images/getByPathAndEventId/${eventId}/common`
  ).then((res) => res.json());

  return { props: { imageList, commonImages, eventInfo, bib } };
}
