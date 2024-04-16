const getStartMultipartUploadURL = async (path: string, fileName: string) => {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;

  return await fetch(`${domain}/start-upload`, {
    method: "POST",
    body: JSON.stringify({
      fileName,
      path,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());
};

export default getStartMultipartUploadURL;
