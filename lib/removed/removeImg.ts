import { message } from "antd";

const featureImg = ({
  eventId,
  id,
  author,
  isRemoved,
}: {
  eventId: string;
  id: string;
  author: string;
  isRemoved: boolean;
}) => {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const response = fetch(
    `${domain}/api/photographer/setStatus/${eventId}/${id}/${author}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isRemoved: !isRemoved }),
    }
  )
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        message.success(isRemoved ? "從相簿恢復" : "從相簿移除成功");
        return data;
      } else {
        message.error("設定精選失敗");
      }
    });

  return response;
};

export default featureImg;
