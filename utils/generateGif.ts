import dayjs from "dayjs";
import { sha256 } from "js-sha256";

const generateGif = async (
  imageIdList: any[],
  eventId: string,
  userId: string
) => {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;

  const dateTime = dayjs().format("YYYYMMDDHHmmss");

  const res = await fetch(`${domain}/api/orders/generateGif`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + userId,
      secret: sha256(userId + process.env.NEXT_PUBLIC_SALT),
    },
    body: JSON.stringify({
      imageIds: imageIdList,
      eventId,
      fileName: `${dateTime}.gif`,
    }),
  });

  return res.json();
};

export default generateGif;
