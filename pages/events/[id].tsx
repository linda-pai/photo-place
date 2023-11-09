import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import { useEffect, useState } from "react";
import { message } from "antd";
import { ShoppingCartOutlined, HeartOutlined } from "@ant-design/icons";
import ImgsViewer from "react-images-viewer";
// https://guonanci.github.io/react-images-viewer/

import SearchWrapper from "@/pages/components/SearchWrapper";

// Post component
export default function EventSearchPage({
  eventId,
  imageList,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [search, setSearch] = useState("");
  const [images, setImages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currImg, setCurrImg] = useState(0);

  useEffect(() => {
    setImages(imageList);
  }, []);

  const handleOnChange = (e: any) => {
    setSearch(e.target.value.trim());
  };

  const onSearch = () => {
    if (search.match(/^[0-9]+$/) == null)
      return message.error("請輸入正確的號碼布");

    fetch(
      `http://localhost:3001/api/images/getByBidAndEventId/${eventId}/${search}`
    )
      .then((res) => res.json())
      .then((data) => {
        setImages(data);
        setShowModal(true);
      });
  };

  const handleClickImg = (id: string) => {
    setShowImageViewer(true);
    setCurrImg(images.findIndex((item: any) => item.id === id));
  };

  const handleAddToCart = (id: string) => {
    //check if cart exist
    const currentCart = JSON.parse(sessionStorage.getItem("cart") || "{}");

    const isExist = currentCart[eventId]?.includes(id);
    if (!isExist) {
      //存入session
      currentCart[eventId] = [...(currentCart[eventId] || []), id];
      sessionStorage.setItem("cart", JSON.stringify(currentCart));
      message.success("已加入購物車");
    }
  };

  const handleAddToFavorite = (id: string) => {};

  console.log("images", images);

  const viewerImgArray = images.map((image: any, key: number) => {
    return {
      src: image.watermarkedUrl,
      caption: (
        <div className="flex gap-4">
          <button onClick={() => handleAddToCart(image.id)}>
            <ShoppingCartOutlined style={{ fontSize: "32px" }} />
          </button>
          <button onClick={() => handleAddToFavorite(image.id)}>
            <HeartOutlined style={{ fontSize: "32px" }} />
          </button>
        </div>
      ),
    };
  });

  const flatted = viewerImgArray.flat();

  const ImageItems = (imageUrl: any, id: string) => (
    <div
      className="item cursor-pointer scale-100 hover:scale-105 transition-all duration-300"
      key={id}
      onClick={() => handleClickImg(id)}
    >
      <img className="item__content" src={imageUrl} />
      <p>key:{id} </p>
    </div>
  );
  return (
    <>
      <SearchWrapper handleOnChange={handleOnChange} onSearch={onSearch} />
      <div className="container mx-auto">
        <div className="text-center m-10">
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
          <p>不囉唆⚡全部 7 折優惠</p>
        </div>
        <div className="masonry">
          {images.map((item: any) => ImageItems(item.watermarkedUrl, item.id))}
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
      </div>
    </>
  );
}

export async function getServerSideProps(context: any) {
  const eventId = context.params.id;

  const imageList = await fetch(
    `http://localhost:3001/api/images/getByEventId/${eventId}`
  )
    .then((res) => res.json())
    .then((data) => {
      const flattenData = data.map((item: any) => item.images).flat();
      return flattenData;
    });

  return { props: { eventId, imageList } };
}
