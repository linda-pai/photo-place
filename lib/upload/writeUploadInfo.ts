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
  fileList: object;
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

const removeUploadProgress = async (reqBody: {
  eventId: string;
  author: string;
  fileList: object;
}) => {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;

  const response = await fetch(`${domain}/api/upload/remove-upload-progress`, {
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
    `${domain}/api/progress/get-upload-progress?eventId=${eventId}&author=${author}`
  ).then((res) => res.json());

  return (await response) || [];
};

export {
  writeUploadInfo,
  writeUploadProgress,
  removeUploadProgress,
  getUploadProgress,
};
