//非 multipart upload 的 getSignedURL
const getSignedUploadURL = async (reqBody: {
  eventId: string;
  fileName: string;
  uploadId: string;
}) => {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;

  const response = await fetch(`${domain}/api/upload/getSignedUploadURL`, {
    method: "POST",
    body: JSON.stringify(reqBody),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());

  return await response;
};

export default getSignedUploadURL;
