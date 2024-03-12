const getSignedMultipleUploadURL = async (key: string) => {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;

  const response = await fetch(`${domain}/start-upload?key=${key}`).then(
    (res) => res.json()
  );
  return response;
};

export default getSignedMultipleUploadURL;
