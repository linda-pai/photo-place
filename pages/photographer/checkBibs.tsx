import React, { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import {
  Button,
  Pagination,
  Radio,
  Spin,
  message,
  Progress,
  Input,
  Empty,
} from "antd";
import {
  DeleteOutlined,
  StarOutlined,
  ReloadOutlined,
  BookOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { sha256 } from "js-sha256";
import { ImageItemProps } from "@/types/interfaces/ImageDataProps";
import ImageLightBox from "@/components/image/ImageLightBox";
import userPermission from "@/hooks/usePermission";
import featureImg from "@/lib/featured/featureImg";
import { DETECTING_IMG } from "@/constants";
import debounce from "@/utils/debounce";
import isUploadable from "@/utils/isUploadable";

const AddableTags = dynamic(() => import("@/components/AddableTags"), {
  loading: () => <Spin />,
});

export default function CheckBibs({
  eventId,
  date,
}: {
  eventId: string;
  date: string;
}) {
  const title = "編輯照片 - " + process.env.NEXT_PUBLIC_APP_NAME;
  const isAllowed = userPermission();

  const { data: session }: any = useSession();

  const [images, setImages] = useState([] as ImageItemProps[]);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("lastModified"); //  pathCount or lastModified
  const [eventName, setEventName] = useState("");
  const [search, setSearch] = useState("");

  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currImgIndex, setCurrImgIndex] = useState(0); // [0, images.length - 1
  const [curPage, setCurPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [detectLength, setDetectLength] = useState(0);

  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const pageSize = 24;

  const getImageInfo = debounce(() => {
    setLoading(true);

    fetch(`${domain}/api/photographer/getByAuthor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + session.id,
        secret: sha256(session.id + process.env.NEXT_PUBLIC_SALT),
      },
      body: JSON.stringify({
        eventId,
        author: session.id,
        curPage,
        sortBy,
        fileName: search,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        setImages(data.images);

        if (search) return;
        setTotal(data.totalCount);
        setDetectLength(data.detectedImageLength);
        setEventName(data.images[0].eventName);
      });
  });

  useEffect(() => {
    if (!session) return;
    getImageInfo();
  }, [session, sortBy, curPage, search]);

  const memoImages = useMemo(() => images, [images]);

  const gotoPrevious = () =>
    currImgIndex > 0 && setCurrImgIndex(currImgIndex - 1);

  const gotoNext = () =>
    currImgIndex + 1 < memoImages.length && setCurrImgIndex(currImgIndex + 1);

  const handleClickImg = (id: string) => {
    setShowImageViewer(true);
    setCurrImgIndex(
      memoImages.findIndex((item: ImageItemProps) => item.id === id)
    );
  };

  const updateBibs = (newTags: string[], id: string) => {
    fetch(`${domain}/api/photographer/updateBibs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + session.id,
        secret: sha256(session.id + process.env.NEXT_PUBLIC_SALT),
      },
      body: JSON.stringify({ bibs: newTags, imageId: id, eventId }),
    });

    setImages((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, path: newTags };
        }
        return item;
      })
    );
  };

  const handleDeleteImg = (id: string, isRemoved: boolean, e: any) => {
    e.stopPropagation();

    fetch(
      `${domain}/api/photographer/setStatus/${eventId}/${id}/${session.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + session.id,
          secret: sha256(session.id + process.env.NEXT_PUBLIC_SALT),
        },
        body: JSON.stringify({ isRemoved: !isRemoved }),
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          message.success(isRemoved ? "從相簿恢復" : "從相簿移除成功");
          setImages((prev) =>
            prev.map((item) => {
              if (item.id === id) {
                return { ...item, isRemoved: !item.isRemoved };
              }
              return item;
            })
          );
        } else {
          message.error("刪除失敗");
        }
      });
  };

  const handleFeatureImg = (id: string, isFeatured: boolean, e: any) => {
    e.stopPropagation();

    featureImg({
      eventId,
      id,
      isFeatured,
      session,
    }).then((data) => {
      if (data.status === "success") {
        setImages((prev) =>
          prev.map((item) => {
            if (item.id === id) {
              return { ...item, isFeatured: !item.isFeatured };
            }
            return item;
          })
        );
      }
    });
  };

  const isProcessing = detectLength !== total;

  const onSearch = (value: string) => {
    setSearch(value);
    setLoading(true);
  };

  const onRadioChange = (e: any) => {
    setSortBy(e.target.value);
    setLoading(true);
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="編輯照片" />
        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_APP_URL}/photographer/checkBibs`}
        />
      </Head>

      {isAllowed ? (
        <>
          <div className="text-center mt-24 text-[color:var(--main-color-dark)] mx-2">
            <h1 className="text-center text-2xl mb-2">編輯相簿</h1>
            <h2 className="text-center text-xl mb-2">{eventName}</h2>
            <p className="text-[#9ca3af]">
              您可以在這裡為照片檢查號碼布、選擇精選、從相簿移除照片
            </p>
            <div className="my-4">
              <p>號碼布辨識進度 {detectLength + " / " + total}</p>
              <div className="flex justify-center mx-auto items-center w-80">
                {isProcessing && (
                  <Button
                    onClick={getImageInfo}
                    className="flex items-center mx-1"
                    size="small"
                  >
                    <ReloadOutlined />
                  </Button>
                )}
                <Progress
                  percent={Math.round((detectLength / total) * 100) || 0}
                  status={
                    isProcessing
                      ? "active"
                      : detectLength === 0
                      ? "active"
                      : "success"
                  }
                  className="w-[80%]"
                />
              </div>
            </div>
          </div>

          <div className="container mx-auto sm:my-10 my-4">
            <div className="sm:flex justify-between mx-2 my-2 sm:my-0">
              <div className="sm:flex gap-2">
                <Radio.Group
                  defaultValue="lastModified"
                  buttonStyle="solid"
                  onChange={onRadioChange}
                  disabled={loading}
                  className="sm:mb-0 mb-1"
                >
                  <Radio.Button value="pathCount">
                    按號碼布數量排序
                  </Radio.Button>
                  <Radio.Button value="lastModified">按時間排序</Radio.Button>
                </Radio.Group>
                <div className="mb-2 w-60 ">
                  <Input.Search
                    placeholder="請輸入檔名"
                    onSearch={onSearch}
                    enterButton
                    disabled={loading}
                    type="primary"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/events/${eventId}?bib=&photoBy=`} passHref>
                  <Button className="flex items-center">
                    <BookOutlined />
                    賽事相簿
                  </Button>
                </Link>
                <Link
                  href={`/uploadService/chooseEvent/upload?eventId=${eventId}`}
                  passHref
                >
                  <Button
                    className="flex items-center"
                    disabled={!isUploadable(date)}
                  >
                    <UploadOutlined />
                    上傳照片
                  </Button>
                </Link>
              </div>
            </div>
            {memoImages.length !== 0 ? (
              <>
                <div className="masonry">
                  {!loading ? (
                    memoImages.map((item: any, key: number) => (
                      <div
                        key={key}
                        className={`${`masonry-item-${item.orientation}`} relative masonry-item h-fit cursor-pointer scale-100 hover:scale-105 transition-all duration-300 group`}
                        onClick={() => handleClickImg(item.id)}
                      >
                        <Image
                          className="w-full h-auto"
                          src={item.watermarkedUrl || DETECTING_IMG}
                          alt={item.watermarkedUrl || DETECTING_IMG}
                          width="0"
                          height="0"
                          sizes="100vw"
                          quality={30}
                        />
                        <div className="flex gap-2 py-2 px-1 justify-between items-center bg-[#404040] bg-opacity-40 absolute top-0 w-full  group hover:bg-opacity-80 transition-all duration-300">
                          <p className="w-[60%] text-white ml-1 text-sm break-words">
                            {item.fileName}
                          </p>
                          <div className="w-[40%] flex justify-end">
                            <Button
                              onClick={(e) =>
                                handleDeleteImg(item.id, item.isRemoved, e)
                              }
                              className={`flex items-center justify-center mr-1 ${
                                item.isRemoved
                                  ? "text-white border border-[#fff] bg-[#ef4444]"
                                  : "text-white border border-white bg-transparent"
                              }`}
                              size="small"
                            >
                              <DeleteOutlined />
                            </Button>
                            <Button
                              onClick={(e) =>
                                handleFeatureImg(item.id, item.isFeatured, e)
                              }
                              className={`flex items-center justify-center mr-1 ${
                                item.isFeatured
                                  ? "text-white border border-[#fff] bg-[color:var(--main-color)] text-[#fff]"
                                  : "text-white bg-[#fff] border border-white bg-transparent"
                              }`}
                              size="small"
                            >
                              <StarOutlined />
                            </Button>
                          </div>
                        </div>
                        <div className="absolute bottom-0">
                          <AddableTags
                            key={memoImages[key].path}
                            bibs={item.path.map((tag: string) =>
                              tag === "common" ? "" : tag
                            )}
                            handleUpdateBibs={(newTags: string[]) =>
                              updateBibs(newTags, item.id)
                            }
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <Spin className="mx-auto my-[40vh] w-full" size="large" />
                  )}

                  <ImageLightBox
                    images={memoImages}
                    isOpen={showImageViewer}
                    curIndex={currImgIndex}
                    onClose={() => setShowImageViewer(false)}
                    onPrev={gotoPrevious}
                    onNext={gotoNext}
                    customFooter={
                      <div className="absolute bottom-[-20px] left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <AddableTags
                          bibs={memoImages[currImgIndex].path}
                          handleUpdateBibs={(newTags: string[]) =>
                            updateBibs(newTags, memoImages[currImgIndex].id)
                          }
                          key={memoImages[currImgIndex].path}
                        />
                      </div>
                    }
                  />
                </div>

                <div className="text-center my-10">
                  <Pagination
                    defaultCurrent={curPage}
                    onChange={setCurPage}
                    total={total}
                    pageSize={pageSize}
                    showSizeChanger={false}
                    current={curPage}
                  />
                </div>
              </>
            ) : (
              <div className="text-center my-10">
                {loading ? (
                  <Spin className="mx-auto my-[40vh] w-full" size="large" />
                ) : (
                  <Empty />
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <Spin className="mx-auto my-[40vh] w-full" size="large" />
      )}
    </>
  );
}

export async function getServerSideProps(context: any) {
  const eventId = context.query.eventId || "";
  const date = context.query.date || "";

  return {
    props: {
      eventId,
      date,
    },
  };
}
