const writeUploadInfo = async (reqBody: {
  eventId: string;
  eventName: string;
  author: string;
  name: string;
}) => {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;

  const response = await fetch(`${domain}/api/upload/writeUploadInfo`, {
    method: "POST",
    body: JSON.stringify(reqBody),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());

  return await response;
};

export { writeUploadInfo };
