import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Head from "next/head";
import { Pagination, Spin, Button } from "antd";
import { StarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { ImageItemProps } from "@/types/interfaces/ImageDataProps";
import ImageLightBox from "@/components/image/ImageLightBox";
import userPermission from "@/hooks/usePermission";
import featureImg from "@/lib/featured/featureImg";
import dynamic from "next/dynamic";
import { DETECTING_IMG } from "@/constants";

const WatermarkModal = dynamic(
  () => import("@/components/addWatermark/WatermarkModal"),
  {
    loading: () => <Spin />,
  }
);

export default function Featured({ eventId }: { eventId: string }) {
  const title = "精選照片 - " + process.env.NEXT_PUBLIC_APP_NAME;
  const isAllowed = userPermission();

  const { data: session }: any = useSession();

  const [featuredImages, setFeaturedImages] = useState([] as ImageItemProps[]); // [0, images.length - 1

  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currImgIndex, setCurrImgIndex] = useState(0); // [0, images.length - 1
  const [curPage, setCurPage] = useState(1);

  const [totalFeatured, setTotalFeatured] = useState(0);

  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const pageSize = 24;

  useEffect(() => {
    if (!session) return;

    fetch(
      `${domain}/api/images/getFeatured/${eventId}/${session.id}?page=${curPage}`
    )
      .then((res) => res.json())
      .then((data) => {
        setFeaturedImages(data.images);
        setTotalFeatured(data.totalCount);
      });
  }, [session, curPage]);

  const gotoPrevious = () =>
    currImgIndex > 0 && setCurrImgIndex(currImgIndex - 1);

  const gotoNext = () =>
    currImgIndex + 1 < featuredImages.length &&
    setCurrImgIndex(currImgIndex + 1);

  const handleClickImg = (id: string) => {
    setShowImageViewer(true);
    setCurrImgIndex(
      featuredImages.findIndex((item: ImageItemProps) => item.id === id)
    );
  };

  const handleFeatureImg = (id: string, isFeatured: boolean, e: any) => {
    if (!session) return;
    e.stopPropagation();

    featureImg({
      eventId,
      id,
      author: session.id,
      isFeatured,
    });
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="精選照片" />
        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_APP_URL}/photographer/featured`}
        />
      </Head>

      {isAllowed ? (
        <>
          <div className="container mx-auto text-slate-600 my-24 overflow-hidden">
            <h2 className="text-center text-2xl mb-8">精選照片</h2>
            {featuredImages.length > 0 && (
              <div className="container mx-auto sm:my-10 my-4">
                <WatermarkModal
                  featuredImages={featuredImages}
                  eventId={eventId}
                />

                <div className="masonry">
                  {featuredImages.map((item: any, key: number) => (
                    <div
                      className="masonry-item h-fit cursor-pointer scale-100 hover:scale-105 transition-all duration-300 group overflow-hidden relative"
                      key={item.id}
                      onClick={() => handleClickImg(item.id)}
                    >
                      <Image
                        src={item.url || DETECTING_IMG}
                        alt={item.url || DETECTING_IMG}
                        width={300}
                        height={400}
                        quality={30}
                      />
                      <div className="group-hover:flex gap-2 justify-end hidden bg-[#fff] bg-opacity-70 absolute top-0 w-full sm:h-[10%] h-[18%] min-h-[28px] max-h-[34px] group hover:bg-opacity-90 transition-all duration-300">
                        <Button
                          onClick={(e) =>
                            handleFeatureImg(item.id, item.isFeatured, e)
                          }
                          className={`flex items-center justify-center mr-2 ${
                            item.isFeatured
                              ? "text-[color:var(--main-color)] border border-[color:var(--main-color)]"
                              : "text-black bg-[#fff] border border-[#000]"
                          }`}
                        >
                          <StarOutlined />
                        </Button>
                      </div>
                      <div className="absolute bottom-0 text-start text-sm text-[color:var(--main-color-dark)] p-1 bg-[#fff] bg-opacity-70">
                        <p>{item.fileName}</p>
                        <p>
                          {dayjs(item.lastModified).format("YYYY/MM/DD HH:mm")}
                        </p>
                      </div>
                    </div>
                  ))}
                  <ImageLightBox
                    images={featuredImages}
                    isOpen={showImageViewer}
                    curIndex={currImgIndex}
                    onClose={() => setShowImageViewer(false)}
                    onPrev={gotoPrevious}
                    onNext={gotoNext}
                    customFooter={null}
                  />
                </div>
                <div className="text-center my-10">
                  <Pagination
                    defaultCurrent={curPage}
                    onChange={setCurPage}
                    total={totalFeatured}
                    pageSize={pageSize}
                    showSizeChanger={false}
                    current={curPage}
                  />
                </div>
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
  const eventId = context.query.eventId;

  return {
    props: {
      eventId: eventId || "",
    },
  };
}
