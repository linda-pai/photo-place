import { message } from "antd";
import { sha256 } from "js-sha256";

const featureImg = ({
  eventId,
  id,
  isFeatured,
  session,
}: {
  eventId: string;
  id: string;
  isFeatured: boolean;
  session: any;
}) => {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const response = fetch(
    `${domain}/api/photographer/setStatus/${eventId}/${id}/${session.id}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + session.id,
        secret: sha256(session.id + process.env.NEXT_PUBLIC_SALT),
      },
      body: JSON.stringify({ isFeatured: !isFeatured }),
    }
  )
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        message.success(isFeatured ? "取消精選成功" : "設定精選成功");
      } else {
        message.error(data.message || "設定精選失敗");
      }
      return data;
    });

  return response;
};

export default featureImg;
