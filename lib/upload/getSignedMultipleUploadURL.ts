const getSignedMultipleUploadURL = async (path: string, fileName: string) => {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;

  const response = await fetch(
    `${domain}/start-upload?fileName=${fileName}&path=${path}`
  ).then((res) => res.json());

  return response;
};

export default getSignedMultipleUploadURL;
