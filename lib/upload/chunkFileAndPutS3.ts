const chunkFileAndPutS3 = async (file: File, uploadId: string, key: string) => {
  const chunkSize = 5 * 1024 * 1024;
  const NUM_CHUNKS = Math.floor(file.size / chunkSize) + 1;

  let promisesArray = [] as any;
  let uploadPartsArray = [] as any;

  //upload each chunk
  for (let i = 1; i < NUM_CHUNKS + 1; i++) {
    const start = (i - 1) * chunkSize;
    const end = i * chunkSize;
    const chunk = i < NUM_CHUNKS ? file.slice(start, end) : file.slice(start);

    //get presigned url
    await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/upload/get-upload-url?uploadId=${uploadId}&fileName=${file.name}&partNumber=${i}&key=${key}`
    )
      .then((res) => res.json())
      .then((result) => {
        //put chunk to presigned url
        const { preSignedURL } = result;
        let uploadResp = fetch(preSignedURL, {
          method: "PUT",
          body: chunk,
          headers: {
            "Content-Type": "image/*",
          },
        }).then((data) => data);

        promisesArray.push(uploadResp);
      });
  }

  await Promise.all(promisesArray).then((resolvedArray: any[]) => {
    resolvedArray.forEach((resolvedPromise, index) => {
      uploadPartsArray.push({
        ETag: resolvedPromise.headers.get("ETag"),
        PartNumber: index + 1,
      });
    });
  });

  return uploadPartsArray;
};

export default chunkFileAndPutS3;
