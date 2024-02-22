import { useEffect, useState } from "react";
import { message, Button, Tag, Spin, Pagination } from "antd";
import { setCookie, getCookie } from "cookies-next";
import scrollIntoViewWithOffset from "@/utils/scrollIntoViewWithOffset";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { searchTracking } from "@/lib/gtag";

const SearchWrapper = dynamic(() => import("@/components/SearchWrapper"), {
  loading: () => <Spin />,
});

const ImageList = dynamic(() => import("@/components/image/ImageList"), {
  loading: () => <Spin />,
});

const NotifyForm = dynamic(() => import("@/components/NotifyForm"), {
  loading: () => <Spin />,
});

interface ImageItemProps {
  eventId: string;
  eventName: string;
  id: string;
  watermarkedUrl: string;
}
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
  const { data: session }: any = useSession();

  const router = useRouter();

  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const [search, setSearch] = useState(bib || "");
  const [images, setImages] = useState([] as ImageItemProps[]);
  const [showModal, setShowModal] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [showImageViewerCommon, setShowImageViewerCommon] = useState(false);
  const [currImgIndex, setCurrImgIndex] = useState(0); // [0, images.length - 1
  const [currCommonImgIndex, setCurrCommonImgIndex] = useState(0); // [0, images.length - 1
  const [curPage, setCurPage] = useState(page || 1);
  const [total, setTotal] = useState(imageListTotal);

  //id as evetId
  const { eventId, eventName, coverImg } = eventInfo;

  useEffect(() => {
    setImages(imageList);
  }, []);

  useEffect(() => {
    const dataLength = search ? images.length : imageListTotal;
    setTotal(dataLength);
  }, [images]);

  useEffect(() => {
    if (curPage) onSearch();
  }, [curPage]);

  const handleOnChange = (e: any) => {
    setSearch(e.target.value.trim());
    setShowModal(false);
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
          user_id: session?.id,
        });
      });
  };

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
  };

  const handleClickImg = (id: string) => {
    setShowImageViewer(true);
    setCurrImgIndex(images.findIndex((item: ImageItemProps) => item.id === id));
  };

  const handleClickImgCommon = (id: string) => {
    setShowImageViewerCommon(true);
    setCurrCommonImgIndex(
      commonImages.findIndex((item: ImageItemProps) => item.id === id)
    );
  };

  const gotoPreviousCommon = () =>
    currCommonImgIndex > 0 && setCurrCommonImgIndex(currCommonImgIndex - 1);

  const gotoNextCommon = () =>
    currCommonImgIndex + 1 < commonImages.length &&
    setCurrCommonImgIndex(currCommonImgIndex + 1);

  const gotoPrevious = () =>
    currImgIndex > 0 && setCurrImgIndex(currImgIndex - 1);

  const gotoNext = () =>
    currImgIndex + 1 < images.length && setCurrImgIndex(currImgIndex + 1);

  return (
    <>
      <Head>
        <title>{`${eventName} | 號碼布搜尋照片 | Photo Pacer 攝影小隊`}</title>
        <meta
          property="og:title"
          content={`${eventName} | 號碼布搜尋照片 | Photo Pacer 攝影小隊`}
        />
        <meta name="description" content={`號碼布辨識系統，快入找到賽事相片`} />
        <meta
          property="og:description"
          content={`號碼布辨識系統，快入找到賽事相片`}
        />
        <meta property="og:image" content={coverImg} />
        <meta
          property="og:url"
          content={`${process.env.NEXT_PUBLIC_APP_URL}/events/${eventId}`}
        />
        <meta
          itemProp="name"
          content={`${eventName} | 號碼布搜尋照片 | Photo Pacer 攝影小隊`}
        />
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
          search={search}
        />
      </div>
      <div id="result-container">
        {imageList.length === 0 ? (
          <div className="container mx-auto sm:my-10 my-4">
            <NotifyForm eventName={eventName} eventId={eventId} />
          </div>
        ) : (
          <div className="container mx-auto sm:my-10 my-4">
            <div
              className={
                showModal && search
                  ? "visible text-center sm:m-10 m-4 text-[color:var(--main-color-dark)]"
                  : "invisible h-0"
              }
            >
              {/* <p>試營運期間，只有一位攝影師🥲</p> */}
              {
                <>
                  <p>{`號碼布: ${search}`}</p>
                  <p>{`找到 ${images.length} 張照片，${
                    images.length == 0
                      ? "我們未來會努力增加攝影師的💪"
                      : "太有緣份了！"
                  }`}</p>
                </>
              }
              {/* <p>不囉唆⚡全面 65 折優惠</p> */}
            </div>

            {images.length > 0 && (
              <>
                <div className="my-2 mx-3 text-[color:var(--main-color-dark)] text-sm">
                  <Tag color="#B0B97A">已完成辨識號碼布</Tag>
                </div>
                <ImageList
                  images={images}
                  isOpen={showImageViewer}
                  curIndex={currImgIndex}
                  onClose={() => setShowImageViewer(false)}
                  onPrev={gotoPrevious}
                  onNext={gotoNext}
                  handleClickImg={handleClickImg}
                  eventId={eventId}
                  eventName={eventName}
                />

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
                <ImageList
                  images={commonImages}
                  isOpen={showImageViewerCommon}
                  curIndex={currCommonImgIndex}
                  onClose={() => setShowImageViewerCommon(false)}
                  onPrev={gotoPreviousCommon}
                  onNext={gotoNextCommon}
                  handleClickImg={handleClickImgCommon}
                  eventId={eventId}
                  eventName={eventName}
                />
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
        )}
      </div>
    </>
  );
}

export async function getServerSideProps(context: any) {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const eventId = context.params.id;
  const bib = context.query.bib || "";
  const page = Number(context.query.page);

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
