const addWatermark = async (reqBody: {
  key: string;
  eventId: string;
  eventName: string;
  fileName: string;
  lastModified: number;
  author: string;
  price: number;
}) => {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;

  const response = await fetch(`${domain}/api/images/addWatermark`, {
    method: "POST",
    body: JSON.stringify(reqBody),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());

  return await response;
};
export default addWatermark;
