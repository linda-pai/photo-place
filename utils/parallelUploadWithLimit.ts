import getSignedMultipleUploadURL from "@/lib/upload/getSignedMultipleUploadURL";

const handleMultipleStartUpload = async (file: File, eventId: string) => {
  const fileName = file.name;
  const path = `/${eventId}/`;
  //1. start-upload
  return await getSignedMultipleUploadURL(path, fileName);
};

const parallelUploadWithLimit = async (
  eventId: string,
  fileOptionsList: any[],
  toBeUploadList: any[],
  groupLimit: number,
  chunkFileAndUpload: (file: any, uploadId: string, key: string) => Promise<any>
) => {
  const promisesArray = [] as any;
  for (let index = 0; index < toBeUploadList.length; index++) {
    const file = fileOptionsList.find(
      (file: any) => file.path === toBeUploadList[index].path
    );
    if (!file) return;
    //start upload
    const { uploadId, key } = await handleMultipleStartUpload(file, eventId);
    //upload
    const promise = chunkFileAndUpload(file, uploadId, key);
    promisesArray.push(promise);

    // if index is multiple of groupLimit, wait for all promises to resolve
    if (index % groupLimit === 0) {
      await Promise.all(promisesArray).then(() => {
        promisesArray.length = 0;
      });
    }

    // if it's the last item, wait for all promises to resolve
    if (index === toBeUploadList.length - 1) {
      await Promise.all(promisesArray).then(() => {
        promisesArray.length = 0;
      });
    }
  }
};
export default parallelUploadWithLimit;
