import { useEffect, useState, useMemo } from "react";
import { message, Button, Spin, Radio, Select, TimePicker, Empty } from "antd";
import { setCookie, getCookie } from "cookies-next";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import scrollIntoViewWithOffset from "@/utils/scrollIntoViewWithOffset";
import { searchTracking } from "@/lib/gtag";
import { ImageItemProps } from "@/types/interfaces/ImageDataProps";
import { IMAGE_STATUS, SITE_NAME } from "@/constants";
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
  photoBy,
  dateTime,
  categoryQuery,
  imagesInfo,
  unIdentifyImagesInfo,
  allImagesInfo,
  photographerOptions,
}: any) {
  const pageSize = 24;
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;

  const { eventId, eventName, coverImg, description, date } = eventInfo;
  const title = `${eventName} | 號碼布搜尋照片 | Photo Pacer 攝影小隊`;

  const { data: session }: any = useSession();
  const router = useRouter();

  const [search, setSearch] = useState(bib || "");
  const [isSearched, setIsSearched] = useState(false);
  const [images, setImages] = useState({
    [IMAGE_STATUS.IDENTIFYED]: imagesInfo.images as ImageItemProps[],
    [IMAGE_STATUS.UNIDENTIFYED]:
      unIdentifyImagesInfo.images as ImageItemProps[],
    [IMAGE_STATUS.ALL]: allImagesInfo.images as ImageItemProps[],
    [IMAGE_STATUS.MORE]: [] as ImageItemProps[],
  });

  const [isGetMore, setIsGetMore] = useState(false);
  const [isGetMoreLoading, setIsGetMoreLoading] = useState(false);
  const [disableReset, setDisableReset] = useState(true);

  const [loadedCount, setLoadedCount] = useState({
    [IMAGE_STATUS.IDENTIFYED]: 0,
    [IMAGE_STATUS.UNIDENTIFYED]: 0,
    [IMAGE_STATUS.ALL]: 0,
    [IMAGE_STATUS.MORE]: 0,
  });

  const [category, setCategory] = useState(categoryQuery);
  const [author, setAuthor] = useState(photoBy || "");
  const [lastModified, setLastModified] = useState(dateTime || []);
  const [isLoading, setIsLoading] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currImgIndex, setCurrImgIndex] = useState(0); // [0, images.length - 1
  const [curPage, setCurPage] = useState({
    [IMAGE_STATUS.IDENTIFYED]: 1,
    [IMAGE_STATUS.UNIDENTIFYED]: 1,
    [IMAGE_STATUS.ALL]: 1,
    [IMAGE_STATUS.MORE]: 1,
  });

  const [total, setTotal] = useState({
    [IMAGE_STATUS.IDENTIFYED]: imagesInfo.totalCount,
    [IMAGE_STATUS.UNIDENTIFYED]: unIdentifyImagesInfo.totalCount,
    [IMAGE_STATUS.ALL]: allImagesInfo.totalCount,
    [IMAGE_STATUS.MORE]: 0,
  });

  const lastPage = {
    [IMAGE_STATUS.IDENTIFYED]: Math.ceil(
      total[IMAGE_STATUS.IDENTIFYED] / pageSize
    ),
    [IMAGE_STATUS.UNIDENTIFYED]: Math.ceil(
      total[IMAGE_STATUS.UNIDENTIFYED] / pageSize
    ),
    [IMAGE_STATUS.ALL]: Math.ceil(total[IMAGE_STATUS.ALL] / pageSize),
    [IMAGE_STATUS.MORE]: Math.ceil(total[IMAGE_STATUS.MORE] / pageSize),
  };

  useEffect(() => {
    if (category === IMAGE_STATUS.MORE) return;
    onSearch();
  }, [curPage, author, lastModified, category]);

  useEffect(() => {
    if (isGetMore) getMoreImages();
  }, [curPage[IMAGE_STATUS.MORE]]);

  useEffect(() => {
    if (search && isSearched) {
      setCurPage((prev) => {
        return {
          ...prev,
          [category]: 1,
        };
      });
      setCategory(IMAGE_STATUS.ALL);
    }
  }, [search, isSearched]);

  useEffect(() => {
    if (search || author || lastModified.length > 0) {
      setDisableReset(false);
    } else {
      setDisableReset(true);
      setIsSearched(false);
    }
  }, [search, author, lastModified]);

  useEffect(() => {
    setIsGetMore(false);
    setCategory(IMAGE_STATUS.ALL);
  }, [lastModified]);

  const memoImages = useMemo(() => {
    return {
      [IMAGE_STATUS.IDENTIFYED]: images[IMAGE_STATUS.IDENTIFYED],
      [IMAGE_STATUS.UNIDENTIFYED]: images[IMAGE_STATUS.UNIDENTIFYED],
      [IMAGE_STATUS.ALL]: images[IMAGE_STATUS.ALL],
      [IMAGE_STATUS.MORE]: images[IMAGE_STATUS.MORE],
    };
  }, [images]);

  const more = useMemo(() => {
    return {
      images: images[IMAGE_STATUS.MORE],
      curPage: curPage[IMAGE_STATUS.MORE],
    };
  }, [images]);

  const handleOnChangeSearch = (e: any) => {
    setSearch(e.target.value.trim());
    if (e.target.value.trim() === "") {
      resetImages();
    }
    setIsSearched(false);
    setIsGetMore(false);
    setCategory(IMAGE_STATUS.ALL);
  };

  const handleOnChangeCategory = (e: any) => {
    setCategory(e.target.value);
    setSearch("");
  };

  const resetImages = () => {
    setCurPage({
      [IMAGE_STATUS.IDENTIFYED]: 1,
      [IMAGE_STATUS.UNIDENTIFYED]: 1,
      [IMAGE_STATUS.ALL]: 1,
      [IMAGE_STATUS.MORE]: 1,
    });
    setImages({
      [IMAGE_STATUS.IDENTIFYED]: imagesInfo.images,
      [IMAGE_STATUS.UNIDENTIFYED]: unIdentifyImagesInfo.images,
      [IMAGE_STATUS.ALL]: allImagesInfo.images,
      [IMAGE_STATUS.MORE]: [],
    });
    setTotal({
      [IMAGE_STATUS.IDENTIFYED]: imagesInfo.totalCount,
      [IMAGE_STATUS.UNIDENTIFYED]: unIdentifyImagesInfo.totalCount,
      [IMAGE_STATUS.ALL]: allImagesInfo.totalCount,
      [IMAGE_STATUS.MORE]: 0,
    });
  };

  const resetState = () => {
    setAuthor("");
    setLastModified([]);
    setSearch("");
    setCategory(IMAGE_STATUS.ALL);

    setDisableReset(true);
    setIsGetMore(false);
  };

  const onSearch = () => {
    setIsLoading(true);
    if (search !== "" && search.match(/^[0-9]+$/) == null)
      return message.error("請輸入正確的號碼布");

    router.push(
      {
        pathname: `/events/${eventId}`,
        query: {
          bib: search,
          photoBy: author,
          lastModified,
          category,
        },
      },
      undefined,
      { shallow: true }
    );

    fetch(
      `${domain}/api/images/getByPathAndEventId/${eventId}?path=${search}&page=${curPage[category]}&author=${author}&lastModified=${lastModified}&date=${date}&category=${category}`
    )
      .then((res) => res.json())
      .then((data) => {
        setImages((prev) => {
          return {
            ...prev,
            [category]:
              data.images.length === 0
                ? []
                : curPage[category] === 1
                ? data.images
                : [...prev[category], ...data.images],
          };
        });

        setTotal((prev) => {
          return {
            ...prev,
            [category]: data.totalCount,
          };
        });

        // set more to true if nextPage exists
        setIsLoading(false);
        (search || author || lastModified.length > 0) && setIsSearched(true);

        curPage[category] === 1 &&
          scrollIntoViewWithOffset("#result-container", 100);

        //埋點
        searchTracking({
          event_category: "event",
          event_label: eventName,
          search_term: search,
          number_of_results: String(data.length),
          user_id_number: String(session?.id) || "",
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

  const getMoreImages = async () => {
    setIsGetMoreLoading(true);
    //相同 author且 依據lastModified 排序，差距在50000ms以內的視為同一組
    const groupedImages = await images[IMAGE_STATUS.ALL].reduce(
      (acc: any, curr: any) => {
        const lastGroup = acc[acc.length - 1];
        if (
          lastGroup &&
          lastGroup[lastGroup.length - 1].author === curr.author &&
          new Date(curr.lastModified).getTime() -
            new Date(lastGroup[lastGroup.length - 1].lastModified).getTime() <
            50000
        ) {
          lastGroup.push(curr);
        } else {
          acc.push([curr]);
        }
        return acc;
      },
      []
    );

    const intervalGroup = groupedImages.map((group: any) => {
      return {
        start: group[0].lastModified,
        end: group[group.length - 1].lastModified,
        author: group[0].author,
      };
    });

    let accCount = 0;

    return await fetch(
      `${domain}/api/images/getByLastModified/${eventId}?page=${
        curPage[IMAGE_STATUS.MORE]
      }`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intervalGroup,
        }),
      }
    )
      .then((res) => res.json())
      .then((data) => {
        setImages((prev) => {
          return {
            ...prev,
            [IMAGE_STATUS.MORE]:
              curPage[IMAGE_STATUS.MORE] === 1
                ? data.images
                : [...prev[IMAGE_STATUS.MORE], ...data.images],
          };
        });
        setCategory(IMAGE_STATUS.MORE);
        setIsGetMoreLoading(false);
        return (accCount += data.totalCount);
      })
      .then((count) => {
        setTotal((prev) => {
          return {
            ...prev,
            [IMAGE_STATUS.MORE]: count,
          };
        });
      });
  };

  const gotoPrevious = () =>
    currImgIndex > 0 && setCurrImgIndex(currImgIndex - 1);

  const gotoNext = () =>
    currImgIndex + 1 < images[category].length &&
    setCurrImgIndex(currImgIndex + 1);

  const handleOnLoad = () => {
    setLoadedCount((prev) => {
      if (prev[category] >= images[category].length)
        return { ...prev, [category]: images[category].length };
      return {
        ...prev,
        [category]: prev[category] + 1,
      };
    });
  };

  const handleOnChangePhotographer = (value: string) => {
    if (value === "請選擇攝影師") return;
    setCurPage({
      [IMAGE_STATUS.IDENTIFYED]: 1,
      [IMAGE_STATUS.UNIDENTIFYED]: 1,
      [IMAGE_STATUS.ALL]: 1,
      [IMAGE_STATUS.MORE]: 1,
    });
    setAuthor(value);
  };

  const handleOnChangeLastModified = (value: any) => {
    if (value === null) {
      setLastModified([]);
      return;
    } else {
      setCurPage({
        [IMAGE_STATUS.IDENTIFYED]: 1,
        [IMAGE_STATUS.UNIDENTIFYED]: 1,
        [IMAGE_STATUS.ALL]: 1,
        [IMAGE_STATUS.MORE]: 1,
      });
      const eventDate = dayjs(date).format("YYYY-MM-DD");

      const lastModifiedStart =
        `${eventDate}T${dayjs(value[0]).format("HH:mm:ss")}` || "";
      const lastModifiedEnd =
        `${eventDate}T${dayjs(value[1]).format("HH:mm:ss")}` || "";

      setLastModified([lastModifiedStart, lastModifiedEnd]);
    }
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta
          property="og:title"
          content={`${eventName} | 號碼布搜尋照片 | Photo Pacer 攝影小隊`}
        />
        <meta
          name="description"
          content={`${
            description || SITE_NAME
          } - 號碼布辨識系統，快入找到賽事相片`}
        />
        <meta
          property="og:description"
          content={`${
            description || SITE_NAME
          } - 號碼布辨識系統，快入找到賽事相片`}
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
            <NotifyForm eventName={eventName} eventId={eventId} date={date} />
          </div>
        ) : (
          <div className="container mx-auto sm:my-10 my-4">
            <div
              className={
                isSearched
                  ? "visible text-center sm:m-10 m-4 text-[color:var(--main-color-dark)]"
                  : "invisible h-0"
              }
            >
              {/* <p>試營運期間，只有一位攝影師🥲</p> */}
              {
                <>
                  <div className="flex items-center gap-2 justify-center">
                    {search && <p>{`號碼布: ${search}`} | </p>}
                    {author && (
                      <p>
                        {`攝影師: ${
                          photographerOptions.find(
                            (item: any) => item.value === author
                          )?.label
                        }`}{" "}
                        |{" "}
                      </p>
                    )}
                    {lastModified.length > 0 && (
                      <p>
                        {`時間: ${dayjs(lastModified[0]).format(
                          "HH:mm"
                        )} ~ ${dayjs(lastModified[1]).format("HH:mm")}`}{" "}
                        |{" "}
                      </p>
                    )}
                    搜尋結果：
                  </div>
                  <p>{`找到 ${
                    isGetMore ? total[IMAGE_STATUS.MORE] : total[category]
                  } 張照片${
                    images?.[category]?.length === 0
                      ? "，我們未來會努力增加攝影師的💪"
                      : ""
                  }`}</p>
                </>
              }
              {/* <p>不囉唆⚡全面 65 折優惠</p> */}
              {memoImages[category]?.length > 0 && search && (
                <div
                  className="my-4 flex justify-center gap-3"
                  onClick={() => setIsGetMore((prev) => !prev)}
                >
                  <p>號碼布可能被擋到了...</p>
                  {isGetMore ? (
                    <Button
                      loading={isGetMoreLoading}
                      onClick={() => setCategory(IMAGE_STATUS.ALL)}
                    >
                      返回
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        getMoreImages();
                      }}
                      loading={isGetMoreLoading}
                    >
                      顯示前後5秒內的照片
                    </Button>
                  )}
                </div>
              )}
            </div>

            {
              <div className="sm:flex items-center mx-3 my-1">
                <div className="my-1 mx-1 text-[color:var(--main-color-dark)] text-sm">
                  <Radio.Group
                    defaultValue={IMAGE_STATUS.IDENTIFYED}
                    buttonStyle="solid"
                    onChange={handleOnChangeCategory}
                    value={category}
                  >
                    <Radio.Button value={IMAGE_STATUS.ALL}>全部</Radio.Button>
                    <Radio.Button value={IMAGE_STATUS.IDENTIFYED}>
                      精選照片
                    </Radio.Button>
                    <Radio.Button value={IMAGE_STATUS.UNIDENTIFYED}>
                      無法辨識號碼布
                    </Radio.Button>
                  </Radio.Group>
                </div>
                <Select
                  className="mx-1 my-1 w-[200px]"
                  options={[
                    { label: "全部", value: "" },
                    ...photographerOptions,
                  ]}
                  onChange={handleOnChangePhotographer}
                  placeholder="請選擇攝影師"
                  value={author || undefined}
                />
                <TimePicker.RangePicker
                  className="mx-1"
                  format="HH:mm"
                  placeholder={["開始時間", "結束時間"]}
                  onChange={handleOnChangeLastModified}
                  value={
                    lastModified.length > 0
                      ? [dayjs(lastModified[0]), dayjs(lastModified[1])]
                      : undefined
                  }
                />
                <Button onClick={() => resetState()} disabled={disableReset}>
                  清空
                </Button>
              </div>
            }
            {/* add transition */}
            {images[category]?.length > 0 ? (
              <>
                <div className="transition-all duration-500 mx-2">
                  <ImageList
                    images={isGetMore ? more.images : memoImages[category]}
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
                  loadedCount[category] === images[category].length && (
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
            ) : (
              <div className="text-center my-10">
                <Empty />
              </div>
            )}
            <div>
              {images[category]?.length > 0 && search && (
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
  const eventId = context.params.id || "";
  const bib = context.query.bib || "";
  const photoBy = context.query.photoBy || "";
  const dateTime = context.query.lastModified || "";
  const categoryQuery = Number(context.query.category) || IMAGE_STATUS.ALL;

  const imagesInfo = await fetch(
    `${domain}/api/images/getByPathAndEventId/${eventId}?category=${IMAGE_STATUS.IDENTIFYED}`
  ).then((res) => res.json());

  const unIdentifyImagesInfo = await fetch(
    `${domain}/api/images/getByPathAndEventId/${eventId}?category=${IMAGE_STATUS.UNIDENTIFYED}`
  ).then((res) => res.json());

  const allImagesInfo = await fetch(
    `${domain}/api/images/getByPathAndEventId/${eventId}?category=${IMAGE_STATUS.ALL}`
  ).then((res) => res.json());

  const eventInfo = await fetch(`${domain}/api/events/getBy/${eventId}`).then(
    (res) => res.json()
  );

  if (!eventInfo) {
    return {
      notFound: true,
    };
  }

  const photographerOptions = await fetch(
    `${domain}/api/events/getPhotographers/${eventId}`
  )
    .then((res) => res.json())
    .then((data) => {
      return data.map((item: any) => {
        return {
          label: item.name,
          value: item.author,
        };
      });
    });

  return {
    props: {
      eventInfo,
      bib,
      photoBy,
      dateTime,
      categoryQuery,
      imagesInfo,
      unIdentifyImagesInfo,
      allImagesInfo,
      photographerOptions,
    },
  };
}
