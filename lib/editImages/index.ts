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

const deleteImg = async ({
  eventId,
  id,
  isRemoved,
  session,
}: {
  eventId: string;
  id: string;
  isRemoved: boolean;
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
      body: JSON.stringify({ isRemoved: !isRemoved }),
    }
  )
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        message.success(isRemoved ? "從相簿恢復" : "從相簿移除成功");
      } else {
        message.error(data.message || "設定精選失敗");
      }
      return data;
    });

  return response;
};

const removeImg = ({
  eventId,
  id,
  isRemoved,
  session,
}: {
  eventId: string;
  id: string;
  isRemoved: boolean;
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
      body: JSON.stringify({ isRemoved: !isRemoved }),
    }
  )
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        message.success(isRemoved ? "從相簿恢復" : "從相簿移除成功");
        return data;
      } else {
        message.error("從相簿移除失敗");
      }
    });

  return response;
};

export { featureImg, deleteImg, removeImg };
