import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Head from "next/head";
import { Button, Pagination, Radio, Spin, Select, Input } from "antd";
import {
  BookOutlined,
  UploadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import { sha256 } from "js-sha256";
import { ImageItemProps } from "@/types/interfaces/ImageDataProps";
import userPermission from "@/hooks/usePermission";
import debounce from "@/utils/debounce";
import isUploadable from "@/utils/isUploadable";
import EditImages from "@/components/editImages";
import { ROLE_ADMIN } from "@/lib/roles";

export default function CheckBibs({
  eventId,
  date,
  photographerOptions,
}: {
  eventId: string;
  date: string;
  photographerOptions: any[];
}) {
  const title = "編輯照片 - " + process.env.NEXT_PUBLIC_APP_NAME;
  const isAllowed = userPermission();

  const { data: session }: any = useSession();

  const [images, setImages] = useState([] as ImageItemProps[]);
  const [total, setTotal] = useState(0);
  const [lastModifiedSorting, setLastModifiedSorting] = useState("asc"); //  asc or desc
  const [detectLengthSorting, setDetectLengthSorting] = useState("asc"); //  asc or desc
  const [eventName, setEventName] = useState("");
  const [search, setSearch] = useState("");

  const [curPage, setCurPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [author, setAuthor] = useState("");

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
        author,
        curPage,
        lastModifiedSorting,
        detectLengthSorting,
        fileName: search,
        isEmptyPath: false,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        setImages(data.images);

        if (search) return;
        setTotal(data.totalCount);
        setEventName(data.images[0]?.eventName);
      });
  });

  useEffect(() => {
    if (!ROLE_ADMIN?.includes(session?.id)) return;
    getImageInfo();
  }, [
    session,
    lastModifiedSorting,
    detectLengthSorting,
    curPage,
    search,
    author,
  ]);

  const onSearch = (value: string) => {
    setSearch(value);
    setLoading(true);
  };

  const onRadioChange = (e: any) => {
    setLastModifiedSorting(e.target.value);
    setLoading(true);
  };

  const onDetectLengthChange = (e: any) => {
    setDetectLengthSorting((prev) =>
      prev === e.target.value ? "" : e.target.value
    );
    setLoading(true);
  };

  const handleOnChangePhotographer = (value: string) => {
    if (value === "請選擇攝影師") return;

    setAuthor(value);
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
          </div>

          <div className="container mx-auto sm:my-10 my-4">
            <div className="sm:flex justify-between mx-2 my-2 sm:my-0">
              <div className="sm:flex gap-2 ">
                <Radio.Group
                  defaultValue="asc"
                  buttonStyle="solid"
                  onChange={onRadioChange}
                  disabled={loading}
                  className="sm:mb-0 mb-1"
                >
                  <Radio.Button value="asc">
                    按時間
                    <ArrowUpOutlined />
                  </Radio.Button>
                  <Radio.Button value="desc">
                    按時間
                    <ArrowDownOutlined />
                  </Radio.Button>
                </Radio.Group>
                <Radio.Group
                  defaultValue="asc"
                  buttonStyle="solid"
                  onChange={onDetectLengthChange}
                  disabled={loading}
                  className="sm:mb-0 mb-1"
                >
                  <Radio.Button value="asc">
                    按號碼布數量
                    <ArrowUpOutlined />
                  </Radio.Button>
                  <Radio.Button value="desc">
                    按號碼布數量
                    <ArrowDownOutlined />
                  </Radio.Button>
                  <Radio.Button value="">取消</Radio.Button>
                </Radio.Group>
                <div className="mb-2 w-60 ">
                  <Input.Search
                    placeholder="請輸入檔名搜尋照片"
                    onSearch={onSearch}
                    enterButton
                    disabled={loading}
                    type="primary"
                  />
                </div>
                <Select
                  className="w-[200px]"
                  options={[
                    { label: "全部", value: "" },
                    ...photographerOptions,
                  ]}
                  onChange={handleOnChangePhotographer}
                  placeholder="請選擇攝影師"
                  value={author || undefined}
                />
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
            <EditImages
              images={images}
              setImages={setImages}
              eventId={eventId}
              loading={loading}
            />
          </div>
          <div className="text-center my-10">
            {!search && (
              <Pagination
                defaultCurrent={curPage}
                onChange={setCurPage}
                total={total}
                pageSize={pageSize}
                showSizeChanger={false}
                current={curPage}
              />
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
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;

  const eventId = context.query.eventId || "";
  const date = context.query.date || "";

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
      eventId,
      date,
      photographerOptions,
    },
  };
}
