import getSignedMultipleUploadURL from "@/lib/upload/getSignedMultipleUploadURL";

const handleMultipleStartUpload = async (file: File, eventId: string) => {
  const fileName = file.name;
  const path = `/${eventId}/`;
  //1. start-upload
  return await getSignedMultipleUploadURL(path, fileName);
};

const parallelUploadWithLimit = async (
  eventId: string,
  fileList: File[],
  groupLimit: number,
  chunkFileAndUpload: (file: any, uploadId: string, key: string) => Promise<any>
) => {
  const promisesArray = [] as any;
  for (let index = 0; index < fileList.length; index++) {
    const file = fileList[index];
    if (!file) return;
    const retryLimit = 3;
    const retryDelay = 10000;

    let attempts = 0;
    let uploadSuccess = false;
    let isRetrying = false;

    while (!uploadSuccess && attempts < retryLimit) {
      if (isRetrying) {
        return;
      }

      isRetrying = true;

      try {
        //1. start upload
        const { uploadId, key } = await handleMultipleStartUpload(
          file,
          eventId
        );
        //2. upload
        const promise = chunkFileAndUpload(file, uploadId, key);
        promisesArray.push(promise);

        // if index is multiple of groupLimit, wait for all promises to resolve
        if (index % groupLimit === 0) {
          await Promise.all(promisesArray).then(() => {
            promisesArray.length = 0;
          });
        }

        // if it's the last item, wait for all promises to resolve
        if (index === fileList.length - 1) {
          await Promise.all(promisesArray).then(() => {
            promisesArray.length = 0;
          });
        }
        uploadSuccess = true;
      } catch (error) {
        console.error(`Upload failed for ${file.name}. Retrying...`);
        attempts++;
        //TODO: Bug: 這邊會一次呼叫3次
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }

    if (!uploadSuccess) {
      console.error(
        `Upload failed for ${file.name} after ${retryLimit} attempts.`
      );
      // Add file back to the queue for retry
      fileList.push(file);
      isRetrying = false;
    }
  }
};
export default parallelUploadWithLimit;
