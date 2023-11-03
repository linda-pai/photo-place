import Link from "next/link";
import dayjs from "dayjs";

interface EventCardProps {
  event: {
    id: number;
    date: string;
    eventName: string;
    coverImg: string;
  };
}

const EventCard = ({ event }: EventCardProps) => {
  const { id, eventName, date, coverImg } = event;

  return (
    <Link href={`/events/${id}`} className="basis-1/4 min-w-[185px]">
      <div className="m-3 bg-white rounded-md overflow-hidden scale-100 hover:scale-105 transition-scale ease-in-out duration-300">
        <div className="relative w-full aspect-[4/5]">
          <img
            src={coverImg}
            alt={eventName}
            className="object-cover w-full h-full opacity-70 hover:opacity-100 duration-300 transition-opacity"
          />
        </div>
        <div className="flex items-center">
          <div className="m-2">
            <div>{dayjs(date).format("YYYY-MM")}</div>
            <div className="text-[60px] border-b-4  border-cyan-600 leading-[60px]">
              {dayjs(date).format("DD")}
            </div>
          </div>
          <div className="m-2">{eventName}</div>
        </div>
      </div>
    </Link>
  );
};
export default EventCard;
