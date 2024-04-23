import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Head from "next/head";
import { Button, Pagination, Radio, Spin, message } from "antd";
import { DeleteOutlined, StarOutlined } from "@ant-design/icons";
import { ImageItemProps } from "@/types/interfaces/ImageDataProps";
import ImageLightBox from "@/components/image/ImageLightBox";
import userPermission from "@/hooks/usePermission";
import featureImg from "@/lib/featured/featureImg";

const AddableTags = dynamic(() => import("@/components/AddableTags"), {
  loading: () => <Spin />,
});

export default function CheckBibs({ eventId }: { eventId: string }) {
  const isAllowed = userPermission();

  const { data: session }: any = useSession();

  const [images, setImages] = useState([] as ImageItemProps[]);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("lastModified"); //  pathCount or lastModified

  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currImgIndex, setCurrImgIndex] = useState(0); // [0, images.length - 1
  const [curPage, setCurPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const pageSize = 20;

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    fetch(
      `${domain}/api/images/getByAuthor/${eventId}/${session.id}/${sortBy}?page=${curPage}`
    )
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        setImages(data.images);
        setTotal(data.totalCount);
      });
  }, [session, sortBy, curPage]);

  const gotoPrevious = () =>
    currImgIndex > 0 && setCurrImgIndex(currImgIndex - 1);

  const gotoNext = () =>
    currImgIndex + 1 < images.length && setCurrImgIndex(currImgIndex + 1);

  const handleClickImg = (id: string) => {
    setShowImageViewer(true);
    setCurrImgIndex(images.findIndex((item: ImageItemProps) => item.id === id));
  };

  const updateBibs = (newTags: string[], id: string) => {
    fetch(`${domain}/api/images/updateBibs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bibs: newTags, imageId: id, eventId }),
    });
  };

  const handleDeleteImg = (id: string, isRemoved: boolean, e: any) => {
    e.stopPropagation();

    fetch(`${domain}/api/images/delete/${eventId}/${id}/${session.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isRemoved: !isRemoved }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          message.success(isRemoved ? "恢復成功" : "移除成功");
          setImages(
            images.map((item) => {
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
      author: session.id,
      isFeatured,
    }).then((data) => {
      if (data.status === "success") {
        setImages(
          images.map((item) => {
            if (item.id === id) {
              return { ...item, isFeatured: !item.isFeatured };
            }
            return item;
          })
        );
      }
    });
  };

  return (
    <>
      <Head>
        <title>編輯照片</title>
        <meta name="description" content="編輯照片" />
        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_APP_URL}/photographer/checkBibs`}
        />
      </Head>

      {isAllowed ? (
        <>
          <div className="text-center mt-24 text-[color:var(--main-color-dark)]">
            <p>編輯照片</p>
            <p>您可以在這裡為照片檢查號碼布、選擇精選、從相簿移除照片</p>
            <p>共 {total} 張照片</p>
          </div>
          {images.length > 0 && (
            <div className="container mx-auto sm:my-10 my-4">
              <div className="flex justify-end mx-4">
                <Radio.Group
                  defaultValue="lastModified"
                  buttonStyle="solid"
                  onChange={(e) => setSortBy(e.target.value)}
                  className="mb-4"
                >
                  <Radio.Button value="pathCount">
                    按號碼布數量排序
                  </Radio.Button>
                  <Radio.Button value="lastModified">按時間排序</Radio.Button>
                </Radio.Group>
              </div>
              <div className="masonry">
                {!loading ? (
                  images.map((item: any, key: number) => (
                    <div key={key} className="relative">
                      <div
                        className="masonry-item h-fit cursor-pointer scale-100 hover:scale-105 transition-all duration-300 group"
                        onClick={() => handleClickImg(item.id)}
                      >
                        <Image
                          className="w-full h-auto"
                          src={item.watermarkedUrl}
                          alt={item.watermarkedUrl}
                          width="0"
                          height="0"
                          sizes="100vw"
                          quality={30}
                        />
                        <div className="flex gap-2 py-5 px-1 justify-between items-center bg-[#404040] bg-opacity-40 absolute top-0 w-full sm:h-[10%] h-[18%] min-h-[28px] max-h-[34px] group hover:bg-opacity-80 transition-all duration-300">
                          <p className="text-white mx-1 text-sm">
                            {item.fileName}
                          </p>
                          <div className="flex justify-end">
                            <Button
                              onClick={(e) =>
                                handleDeleteImg(item.id, item.isRemoved, e)
                              }
                              className={`flex items-center justify-center mr-2 ${
                                item.isRemoved
                                  ? "text-white border border-[#fff] bg-[#ef4444]"
                                  : "text-white border border-white bg-transparent"
                              }`}
                            >
                              <DeleteOutlined />
                            </Button>
                            <Button
                              onClick={(e) =>
                                handleFeatureImg(item.id, item.isFeatured, e)
                              }
                              className={`flex items-center justify-center mr-2 ${
                                item.isFeatured
                                  ? "text-white border border-[#fff] bg-[color:var(--main-color)] text-[#fff]"
                                  : "text-white bg-[#fff] border border-white bg-transparent"
                              }`}
                            >
                              <StarOutlined />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <AddableTags
                        key={images[key].path}
                        bibs={item.path.map((tag: string) =>
                          tag === "common" ? "" : tag
                        )}
                        handleUpdateBibs={(newTags: string[]) =>
                          updateBibs(newTags, item.id)
                        }
                      />
                    </div>
                  ))
                ) : (
                  <Spin className="mx-auto my-[40vh] w-full" size="large" />
                )}

                <ImageLightBox
                  images={images}
                  isOpen={showImageViewer}
                  curIndex={currImgIndex}
                  onClose={() => setShowImageViewer(false)}
                  onPrev={gotoPrevious}
                  onNext={gotoNext}
                  customFooter={
                    <div className="absolute bottom-[-20px] left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <AddableTags
                        bibs={images[currImgIndex].path}
                        handleUpdateBibs={(newTags: string[]) =>
                          updateBibs(newTags, images[currImgIndex].id)
                        }
                        key={images[currImgIndex].path}
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
            </div>
          )}
        </>
      ) : (
        <Spin className="mx-auto my-[40vh] w-full" size="large" />
      )}
    </>
  );
}

export async function getServerSideProps(context: any) {
  const eventId = context.query.eventId;

  return {
    props: {
      eventId,
    },
  };
}
