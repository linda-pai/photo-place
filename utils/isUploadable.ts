import dayjs from "dayjs";

const isUploadable = (date: string) => {
  //date 在 7天前、1天後
  const Aday = 24 * 60 * 60 * 1000;
  return (
    dayjs(date).valueOf() < Date.now() + Aday &&
    dayjs(date).valueOf() > Date.now() - 7 * Aday
  );
};

export default isUploadable;
