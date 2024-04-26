const completeUpload = async (
  uploadData: string,
  uploadPartsArray: any[],
  uploadId: string
) => {
  return await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/complete-upload`, {
    method: "POST",
    body: JSON.stringify({
      uploadData,
      parts: uploadPartsArray,
      uploadId,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());
};
export default completeUpload;
