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

const writeUploadProgress = async (reqBody: {
  eventId: string;
  author: string;
  progress: object;
}) => {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;

  const response = await fetch(`${domain}/api/upload/write-upload-progress`, {
    method: "POST",
    body: JSON.stringify(reqBody),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());

  return await response;
};

const getUploadProgress = async (eventId: string, author: string) => {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;

  const response = await fetch(
    `${domain}/api/upload/get-upload-progress?eventId=${eventId}&author=${author}`
  ).then((res) => res.json());

  return (await response.progress) || [];
};

export { writeUploadInfo, writeUploadProgress, getUploadProgress };
