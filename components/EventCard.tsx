import Link from "next/link";
import dayjs from "dayjs";

const EventCard = ({ event }: any) => {
  const { eventId, eventName, date, coverImg } = event || {};

  return (
    <Link href={`/events/${eventId}`} className="basis-1/5 min-w-[185px]">
      <div className="m-3 bg-[#fff] rounded-md overflow-hidden scale-100 hover:scale-105 transition-scale ease-in-out duration-300 shadow-md">
        <div className="relative w-full aspect-[5/6]">
          <img
            src={coverImg}
            alt={`${eventName}封面照片`}
            className="object-cover w-full h-full opacity-70 hover:opacity-100 duration-300 transition-opacity"
          />
        </div>
        <div className="text-[color:var(--main-color-dark)]">
          <h2 className="m-2 sm:text-xl text-sm text-center two-line-ellipsis">
            {eventName}
          </h2>
          <div className="m-2 rounded-md mx-auto sm:py-1 py-0 sm:px-2 px-1 w-fit bg-[color:var(--main-color)] text-[color:var(--main-color-dark)] opacity-90 text-center sm:text-xs text-[11px]">
            <div>{dayjs(date).format("YYYY-MM-DD")}</div>
          </div>
        </div>
      </div>
    </Link>
  );
};
export default EventCard;
