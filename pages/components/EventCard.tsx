import Link from "next/link";
import dayjs from "dayjs";

const EventCard = ({ event }: any) => {
  const { id, eventName, date, coverImg } = event || {};

  return (
    <Link href={`/events/${id}`} className="basis-1/5 min-w-[185px]">
      <div className="m-3 bg-[#fff] rounded-md overflow-hidden scale-100 hover:scale-105 transition-scale ease-in-out duration-300 shadow-md">
        <div className="relative w-full aspect-[5/6]">
          <img
            src={coverImg}
            alt={eventName}
            className="object-cover w-full h-full opacity-70 hover:opacity-100 duration-300 transition-opacity"
          />
        </div>
        <div className=" items-center text-[color:var(--main-color-dark)]">
          <div className="m-2 text-xl text-center">{eventName}</div>
          <div className="m-2 text-[color:var(--main-color-light)] text-center text-sm">
            <div>{dayjs(date).format("MM-DD")}</div>
          </div>
        </div>
      </div>
    </Link>
  );
};
export default EventCard;
