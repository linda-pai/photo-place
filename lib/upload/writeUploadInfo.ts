const writeUploadInfo = async (reqBody: {
  eventId: string;
  eventName: string;
  author: string;
  name: string;
  images: any[];
}) => {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;

  const response = await fetch(`${domain}/api/images/writeUploadInfo`, {
    method: "POST",
    body: JSON.stringify(reqBody),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());

  return await response;
};

const uploadUploadInfo = async (reqBody: {
  eventId: string;
  author: string;
  images: any[];
}) => {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;

  const response = await fetch(`${domain}/api/images/updateUploadInfo`, {
    method: "POST",
    body: JSON.stringify(reqBody),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());

  return await response;
};

export { writeUploadInfo, uploadUploadInfo };
