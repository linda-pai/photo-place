import { useEffect, useState, useMemo } from "react";
import { message, Button, Spin, Radio } from "antd";
import { setCookie, getCookie } from "cookies-next";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { searchTracking } from "@/lib/gtag";
import { ImageItemProps } from "@/types/interfaces/ImageDataProps";
import { IMAGE_STATUS } from "@/constants";
import LastElement from "@/components/LastElement";

const SearchWrapper = dynamic(() => import("@/components/SearchWrapper"), {
  loading: () => <Spin />,
});

const ImageList = dynamic(() => import("@/components/image/ImageList"), {
  loading: () => <Spin />,
});

const NotifyForm = dynamic(() => import("@/components/NotifyForm"), {
  loading: () => <Spin />,
});

// Post component
export default function EventSearchPage({
  eventInfo,
  navBarRef,
  bib,
  identifyInfo,
  unIdentifyInfo,
}: any) {
  const pageSize = 15;
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;

  const { eventId, eventName, coverImg } = eventInfo;

  const { data: session }: any = useSession();

  const [search, setSearch] = useState(bib || "");
  const [images, setImages] = useState({
    [IMAGE_STATUS.IDENTIFYED]: identifyInfo.images as ImageItemProps[],
    [IMAGE_STATUS.UNIDENTIFYED]: unIdentifyInfo.images as ImageItemProps[],
  });

  const [loadedCount, setLoadedCount] = useState(0);

  const [category, setCategory] = useState(IMAGE_STATUS.IDENTIFYED);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currImgIndex, setCurrImgIndex] = useState(0); // [0, images.length - 1
  const [curPage, setCurPage] = useState({
    [IMAGE_STATUS.IDENTIFYED]: 1,
    [IMAGE_STATUS.UNIDENTIFYED]: 1,
  });

  const lastPage = {
    [IMAGE_STATUS.IDENTIFYED]: Math.ceil(identifyInfo.totalCount / pageSize),
    [IMAGE_STATUS.UNIDENTIFYED]: Math.ceil(
      unIdentifyInfo.totalCount / pageSize
    ),
  };

  useEffect(() => {
    if (curPage[category]) {
      onSearch();
    }
  }, [curPage]);

  //useMemo to prevent re-render
  const unIdentify = useMemo(() => {
    return {
      images: images[IMAGE_STATUS.UNIDENTIFYED],
      curPage: curPage[IMAGE_STATUS.UNIDENTIFYED],
    };
  }, [images]);

  const identify = useMemo(() => {
    return {
      images: images[IMAGE_STATUS.IDENTIFYED],
      curPage: curPage[IMAGE_STATUS.IDENTIFYED],
    };
  }, [images]);

  const handleOnChangeSearch = (e: any) => {
    setSearch(e.target.value.trim());
    setShowModal(false);
  };

  const handleOnChangeCategory = (e: any) => setCategory(e.target.value);

  const onSearch = () => {
    setIsLoading(true);
    if (search !== "" && search.match(/^[0-9]+$/) == null)
      return message.error("請輸入正確的號碼布");

    const searchPage = search ? 1 : curPage[category];
    const searchValue =
      category === IMAGE_STATUS.IDENTIFYED ? search : "unIdentify";

    fetch(
      `${domain}/api/images/getByPathAndEventId/${eventId}?path=${searchValue}&page=${searchPage}`
    )
      .then((res) => res.json())
      .then((data) => {
        setImages((prev) => {
          return {
            ...prev,
            [category]:
              searchPage === 1
                ? data.images
                : [...prev[category], ...data.images],
          };
        });

        // set more to true if nextPage exists
        setIsLoading(false);
        setShowModal(true);

        //埋點
        searchTracking({
          event_category: "event",
          event_label: eventName,
          search_term: search,
          number_of_results: data.length,
          user_id: session?.id || "",
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
    setCurrImgIndex(
      images[category].findIndex((item: ImageItemProps) => item.id === id)
    );
  };

  const gotoPrevious = () =>
    currImgIndex > 0 && setCurrImgIndex(currImgIndex - 1);

  const gotoNext = () =>
    currImgIndex + 1 < images[category].length &&
    setCurrImgIndex(currImgIndex + 1);

  const handleOnLoad = () => {
    setLoadedCount((prev) => prev + 1);
  };

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
          handleOnChange={handleOnChangeSearch}
          onSearch={onSearch}
          eventName={eventName}
          search={search}
        />
      </div>
      <div id="result-container">
        {!eventInfo.isCompleteUpload ? (
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
                  <p>{`找到 ${images[category].length} 張照片，${
                    images[category].length == 0
                      ? "我們未來會努力增加攝影師的💪"
                      : "太有緣份了！"
                  }`}</p>
                </>
              }
              {/* <p>不囉唆⚡全面 65 折優惠</p> */}
            </div>

            {images[category].length > 0 && (
              <>
                <div className="my-4 mx-3 text-[color:var(--main-color-dark)] text-sm">
                  <Radio.Group
                    defaultValue={IMAGE_STATUS.IDENTIFYED}
                    buttonStyle="solid"
                    onChange={handleOnChangeCategory}
                    value={category}
                  >
                    <Radio.Button value={IMAGE_STATUS.IDENTIFYED}>
                      已完成辨識號碼布
                    </Radio.Button>
                    <Radio.Button value={IMAGE_STATUS.UNIDENTIFYED}>
                      未成功辨識號碼布
                    </Radio.Button>
                  </Radio.Group>
                </div>
                {/* add transition */}
                <div className="transition-all duration-500">
                  <ImageList
                    images={
                      category === IMAGE_STATUS.IDENTIFYED
                        ? identify.images
                        : unIdentify.images
                    }
                    isOpen={showImageViewer}
                    curIndex={currImgIndex}
                    onClose={() => setShowImageViewer(false)}
                    onPrev={gotoPrevious}
                    onNext={gotoNext}
                    handleClickImg={handleClickImg}
                    eventId={eventId}
                    eventName={eventName}
                    onLoad={handleOnLoad}
                  />
                </div>
                {lastPage[category] > curPage[category] &&
                  loadedCount === images[category].length && (
                    <LastElement
                      key={category}
                      isLoading={isLoading}
                      intersectionFunc={() =>
                        setCurPage((prev) => {
                          return {
                            ...prev,
                            [category]: prev[category] + 1,
                          };
                        })
                      }
                    />
                  )}
              </>
            )}
            <div>
              {images[category].length > 0 && search && (
                <Button
                  onClick={() => {
                    images[category].map((item: ImageItemProps) =>
                      pushToCart(item.id)
                    );
                    message.success(
                      `已將 ${images[category].length} 張照片加入購物車`
                    );
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

  const unIdentifyInfo = await fetch(
    `${domain}/api/images/getByPathAndEventId/${eventId}?path=unIdentify`
  ).then((res) => res.json());

  const identifyInfo = await fetch(
    `${domain}/api/images/getByPathAndEventId/${eventId}`
  ).then((res) => res.json());

  const eventInfo = await fetch(`${domain}/api/events/getBy/${eventId}`).then(
    (res) => res.json()
  );

  return {
    props: {
      eventInfo,
      bib,
      identifyInfo,
      unIdentifyInfo,
    },
  };
}
