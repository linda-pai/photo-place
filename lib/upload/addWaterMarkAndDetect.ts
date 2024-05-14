import { message } from "antd";
const addWaterMarkAndDetect = async ({
  eventId,
  author,
  isAll,
}: {
  eventId: string;
  author: string;
  isAll: boolean;
}) => {
  fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/images/updateWatermarkUrlAndDetectText`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventId,
        author,
        isAll,
      }),
    }
  )
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        message.error(data.error);
        return;
      }
      message.success("辨識號碼布完成");
    });
};

export default addWaterMarkAndDetect;
