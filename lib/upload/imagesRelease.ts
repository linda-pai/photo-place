import { message } from "antd";

const imagesRelease = async (eventId: string, images: any[]) => {
  const reqBody = {
    eventId,
    images,
  };

  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  //把 isReleased 改成 true
  const response = await fetch(`${domain}/api/images/release`, {
    method: "POST",
    body: JSON.stringify(reqBody),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());

  if (response.status === 200) {
    message.success("發佈成功");
  }
};

export default imagesRelease;
