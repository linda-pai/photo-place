import { useEffect, useState } from "react";
import { message, Button, Tag, Spin, Pagination } from "antd";
import ImgsViewer from "react-images-viewer";
import { setCookie, getCookie } from "cookies-next";
import scrollIntoViewWithOffset from "@/utils/scrollIntoViewWithOffset";
// https://guonanci.github.io/react-images-viewer/
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";
import { clickAddToCart, removeAddToCart, searchTracking } from "@/lib/gtag";
import customImgViewerUI from "@/components/image/CustomImgViewerUI";

interface ImageItemProps {
  eventId: string;
  eventName: string;
  id: string;
  watermarkedUrl: string;
}

const SearchWrapper = dynamic(() => import("@/components/SearchWrapper"), {
  loading: () => <Spin />,
});

const ImageItems = dynamic(() => import("@/components/image/ImageItems"));

// Post component
export default function EventSearchPage({
  eventInfo,
  imageList,
  commonImages,
  navBarRef,
  bib,
  page,
  imageListTotal,
}: any) {
  const router = useRouter();

  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const [search, setSearch] = useState(bib || "");
  const [images, setImages] = useState([] as ImageItemProps[]);
  const [showModal, setShowModal] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [showImageViewerCommon, setShowImageViewerCommon] = useState(false);
  const [currImg, setCurrImg] = useState(0); // [0, images.length - 1
  const [cartData, setCartData] = useState({} as any);
  const [curPage, setCurPage] = useState(page || 1);
  const [total, setTotal] = useState(imageListTotal);

  //id as evetId
  const { eventId, eventName, coverImg } = eventInfo;

  useEffect(() => {
    setImages(imageList);
    setCartData(JSON.parse(getCookie("cart") || "{}"));
  }, []);

  useEffect(() => {
    const dataLength = search ? images.length : imageListTotal;
    setTotal(dataLength);
  }, [images]);

  useEffect(() => {
    if (curPage !== page) onSearch();
  }, [curPage]);

  const handleOnChange = (e: any) => {
    setSearch(e.target.value.trim());
    setCurPage(1);
  };

  const onSearch = () => {
    if (search !== "" && search.match(/^[0-9]+$/) == null)
      return message.error("請輸入正確的號碼布");

    const searchPage = search ? 1 : curPage;
    router.push(
      {
        pathname: `/events/${eventId}`,
        query: { bib: search, page: searchPage },
      },
      undefined,
      { shallow: true }
    );
    const searchValue = search || "all";
    fetch(
      `${domain}/api/images/getByPathAndEventId/${eventId}/${searchValue}?page=${searchPage}`
    )
      .then((res) => res.json())
      .then((data) => {
        setImages(data);
        setShowModal(true);

        scrollIntoViewWithOffset("#result-container", 100);

        //埋點
        searchTracking({
          event_category: "event",
          event_label: eventName,
          search_term: search,
          number_of_results: data.length,
          user_id: getCookie("token"),
        });
      });
  };

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
        current_search: search,
        user_id: getCookie("token"),
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
        user_id: getCookie("token"),
      });
    }
  };

  const handleClickImg = (id: string) => {
    setShowImageViewer(true);
    setCurrImg(images.findIndex((item: ImageItemProps) => item.id === id));
  };

  const handleClickImgCommon = (id: string) => {
    setShowImageViewerCommon(true);
    setCurrImg(
      commonImages.findIndex((item: ImageItemProps) => item.id === id)
    );
  };

  const flatted = customImgViewerUI({
    images,
    isExistInCart,
    handleClickCart,
  });

  const flattedCommon = customImgViewerUI({
    images: commonImages,
    isExistInCart,
    handleClickCart,
  });

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
      <div className="container mx-auto my-10" id="result-container">
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
              {images.map((item: ImageItemProps, key: number) => (
                <ImageItems
                  key={key}
                  item={item}
                  isExistInCart={isExistInCart}
                  handleClickCart={handleClickCart}
                  handleClickImg={handleClickImg}
                />
              ))}
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
          </>
        )}
        {commonImages.length > 0 && !search && (
          <>
            <div className="my-2 mt-16 mb-4 text-[color:var(--main-color-dark)] text-sm">
              <Tag>未成功辨識號碼布</Tag>
            </div>
            <div className="masonry">
              {commonImages.map((item: ImageItemProps, key: number) => (
                <ImageItems
                  key={key}
                  item={item}
                  isExistInCart={isExistInCart}
                  handleClickCart={handleClickCart}
                  handleClickImg={handleClickImgCommon}
                />
              ))}
              <ImgsViewer
                imgs={flattedCommon}
                isOpen={showImageViewerCommon}
                currImg={currImg}
                onClickPrev={() => setCurrImg((prev) => prev - 1)}
                onClickNext={() => setCurrImg((prev) => prev + 1)}
                onClose={() => setShowImageViewerCommon(false)}
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
                images.map((item: ImageItemProps) => pushToCart(item.id));
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
  const page = context.query.page || 1;

  const imageList = await fetch(
    `${domain}/api/images/getByPathAndEventId/${eventId}/all`
  ).then((res) => res.json());

  const commonImages = await fetch(
    `${domain}/api/images/getByPathAndEventId/${eventId}/common`
  ).then((res) => res.json());

  const imageListTotal = await fetch(`${domain}/api/images/getCount/${eventId}`)
    .then((res) => res.json())
    .then((data) => data.count - commonImages.length);

  const eventInfo = await fetch(`${domain}/api/events/getBy/${eventId}`).then(
    (res) => res.json()
  );

  return {
    props: { imageList, commonImages, eventInfo, bib, page, imageListTotal },
  };
}
