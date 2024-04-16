const completeUpload = async (
  key: string,
  uploadPartsArray: any[],
  uploadId: string
) => {
  return await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/complete-upload`, {
    method: "POST",
    body: JSON.stringify({
      key,
      parts: uploadPartsArray,
      uploadId,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());
};
export default completeUpload;
