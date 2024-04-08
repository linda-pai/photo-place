const parallelUploadWithLimit = async (
  fileList: File[],
  groupLimit: number,
  chunkFileAndUpload: (file: any) => any
) => {
  const promisesArray = [] as any;
  for (let index = 0; index < fileList.length; index++) {
    const file = fileList[index];
    if (!file) return;

    // if index is multiple of groupLimit, wait for all promises to resolve
    if (index % groupLimit === 0) {
      await Promise.all(promisesArray).then(() => {
        promisesArray.length = 0;
      });
    }

    // if all files are uploaded, wait for all promises to resolve
    if (index === fileList.length - 1) {
      await Promise.all(promisesArray).then(() => {
        promisesArray.length = 0;
      });
    }

    const promise = chunkFileAndUpload(file);
    promisesArray.push(promise);
  }
};
export default parallelUploadWithLimit;
