const getStartMultipartUploadURL = async (
  eventId: string,
  author: string,
  path: string,
  fileName: string
) => {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;

  return await fetch(`${domain}/api/upload/start-upload`, {
    method: "POST",
    body: JSON.stringify({
      eventId,
      author,
      fileName,
      path,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());
};

export default getStartMultipartUploadURL;
