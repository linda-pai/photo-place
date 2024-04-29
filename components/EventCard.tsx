import Link from "next/link";
import dayjs from "dayjs";
import { Badge } from "antd";
import { VerticalTimelineElement } from "react-vertical-timeline-component";

const EventCard = ({ event }: any) => {
  const { eventId, eventName, date } = event || {};

  const isNew = dayjs().diff(dayjs(date), "day") < 7;

  return (
    <VerticalTimelineElement
      className="vertical-timeline-element--work scale-100 hover:scale-105 transition-scale ease-in-out duration-300 hover:cursor-pointer group"
      contentStyle={{
        // border: "2px solid #ffd700",
        color: "#5f5b50",
        borderRadius: "8px",
        // background: "linear-gradient(180deg, #fff 25%, #ffd70090 100%)",
        background:
          "linear-gradient(rgb(255, 255, 255) 25%, rgba(255, 255, 255, 0.765) 100%)",
        display: "flex",
      }}
      contentArrowStyle={{
        borderRight: "14px solid #fff",
        top: "6px",
      }}
      // date={dayjs(date).format("YYYY-MM-DD")}
      iconStyle={{
        background: "#ffd700",
        color: "#fff",
        height: "50px",
        width: "50px",
      }}
      iconClassName="icon-position"
      icon={
        <Badge count={"馬拉松/路跑"} color="gold" offset={[-24, -14]}>
          <img src="https://www.photopacer.com/favicon.ico" alt="myLogo" />
        </Badge>
      }
    >
      {isNew ? (
        <Badge.Ribbon text={"new"} color="gold">
          <Link
            href={`/events/${eventId}`}
            // className="w-[100%] event-content-wrapper"
            className="w-[100%]"
          >
            <div className="text-center w-100 sm:px-10 sm:px-8 px-1">
              <h2 className="m-2 sm:text-xl text-sm">{eventName}</h2>
              <h4 className="vertical-timeline-element-subtitle">
                {dayjs(event.date).format("YYYY-MM-DD")}
              </h4>
            </div>
          </Link>
        </Badge.Ribbon>
      ) : (
        <Link href={`/events/${eventId}`} className="w-[100%]">
          {/* <div className="text-center w-100 sm:px-10 px-8 event-content-wrapper"> */}
          <div className="text-center w-100 sm:px-10 sm:px-8 px-1">
            <h2 className="m-2 sm:text-xl text-sm">{eventName}</h2>
            <h4 className="vertical-timeline-element-subtitle">
              {dayjs(event.date).format("YYYY-MM-DD")}
            </h4>
          </div>
        </Link>
      )}
    </VerticalTimelineElement>
  );
};
export default EventCard;
