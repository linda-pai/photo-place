import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import { useState } from "react";
import { message } from "antd";

import SeachWrapper from "@/pages/components/SearchWrapper";

export async function getServerSideProps(context: any) {
  const eventId = context.params.id;
  // Fetch data from external API
  //   const res = await fetch(
  //     `http://localhost:3001/api/images/getByBidAndEventId/${eventId}`
  //   );
  //   const data = await res.json();

  // Pass data to the page via props
  return { props: { eventId } };
}

// Post component
function EventSearchPage({
  eventId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [search, setSearch] = useState("");
  const [images, setImages] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const handleOnChange = (e: any) => {
    setSearch(e.target.value.trim());
    setShowModal(false);
  };

  const onSearch = () => {
    if (search.match(/^[0-9]+$/) == null)
      return message.error("請輸入正確的號碼布");
    console.log("/${eventId}/${search}", `/${eventId}/${search}`);

    fetch(
      `http://localhost:3001/api/images/getByBidAndEventId/${eventId}/${search}`
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("data", data);
        setShowModal(true);
        setImages(data);
      });
  };

  console.log("images", images);
  return (
    <>
      <SeachWrapper handleOnChange={handleOnChange} onSearch={onSearch} />
      <div className="container mx-auto">
        <div className="text-center m-10">
          <p>試營運期間，只有一位攝影師🥲</p>
          {images.length == 0 && showModal && search && (
            <p>{`嗚嗚嗚找不到 ${search} 的照片，我們未來會努力的增加攝影師的💪`}</p>
          )}
          <p>
            {images.length > 0
              ? `能拍到您，太有緣份了！`
              : "也喜歡下面的照片嗎？"}
            不囉唆⚡全部 7 折優惠
          </p>
        </div>
        <div className="masonry">
          {images.map((image: any, key: number) => (
            <div className="item" key={key}>
              <img className="item__content" src={image.watermarkedUrl} />
            </div>
          ))}
          {/* <div className="item">
            <img
              className="item__content"
              src="https://photo-place-buckets.s3.ap-northeast-1.amazonaws.com/test/1698748858457-test-logo.png"
            />
         </div> */}
        </div>
      </div>
    </>
  );
}

export default EventSearchPage;
