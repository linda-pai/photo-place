import { message } from "antd";

const featureImg = ({
  eventId,
  id,
  author,
  isFeatured,
}: {
  eventId: string;
  id: string;
  author: string;
  isFeatured: boolean;
}) => {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const response = fetch(
    `${domain}/api/images/setStatus/${eventId}/${id}/${author}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isFeatured: !isFeatured }),
    }
  )
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        message.success(isFeatured ? "取消精選成功" : "設定精選成功");
        return data;
      } else {
        message.error("設定精選失敗");
      }
    });

  return response;
};

export default featureImg;
