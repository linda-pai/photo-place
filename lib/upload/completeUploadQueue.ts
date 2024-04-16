import completeUpload from "@/lib/upload/completeUpload";
import UploadQueue from "@/lib/upload/uploadQueue";

const completeUploadQueue = async (
  key: string,
  file: File,
  uploadPartsArray: any[],
  uploadId: string
) => {
  const completeFunction = async () =>
    await completeUpload(key, uploadPartsArray, uploadId);

  const uploadQueue = new UploadQueue("complete", completeFunction);
  uploadQueue.enqueue([file]);
};

export default completeUploadQueue;
