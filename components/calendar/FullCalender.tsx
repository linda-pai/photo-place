import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid"; // a plugin!
import multiMonthPlugin from "@fullcalendar/multimonth";
import interactionPlugin from "@fullcalendar/interaction";
import { Tooltip } from "antd";
import EventJson from "@/static/eventData.json";
import dynamic from "next/dynamic";

const TimeLineDrawer = dynamic(
  () => import("@/components/calendar/TimeLineDrawer"),
  { ssr: false }
);

export default function Calendar() {
  const [currentView, setCurrentView] = useState("dayGridMonth"); // dayGridMonth, multiMonthPlugin
  const [currEvent, setCurrEvent] = useState<any>(null);

  useEffect(() => {
    setCurrEvent(null);
  }, [currentView]);

  const events: any = EventJson.map((event) => {
    return {
      id: event.eventId,
      title: event.eventName,
      start: event.date,
      url: event.url,
      allDay: true,
      backgroundColor: "#857e85",
      borderColor: "#857e85",
    };
  });

  const renderEventContent = (eventInfo: any) => {
    return (
      <Tooltip
        title={
          eventInfo.event.url ? (
            <a
              href={eventInfo.event.url || undefined}
              target="_blank"
              title={eventInfo.event.title}
            >
              <h3>{eventInfo.event.title}</h3>
            </a>
          ) : (
            <h3>{eventInfo.event.title}</h3>
          )
        }
        open={currEvent === eventInfo.event.id}
      >
        <p>{eventInfo.timeText}</p>
        <h3>{eventInfo.event.title}</h3>
      </Tooltip>
    );
  };

  return (
    <div className="flex gap-1">
      <TimeLineDrawer setCurrEvent={setCurrEvent} />
      <div className="w-full mx-auto px-4">
        <FullCalendar
          plugins={[dayGridPlugin, multiMonthPlugin, interactionPlugin]}
          initialView={currentView}
          key={currentView}
          events={events}
          eventContent={renderEventContent}
          // dayMaxEventRows={true}
          views={{
            dayGrid: {
              type: "dayGridMonth",
              // dayMaxEventRows: 3,
            },
            multiMonthPlugin: {
              type: "multiMonth",
              duration: { months: 12 },
            },
          }}
          locale={"zh-tw"}
          headerToolbar={{
            start: "title", // will normally be on the left. if RTL, will be on the right
            center: "dayGridMonth,multiMonthPlugin",
            end: currentView === "dayGridMonth" ? "today prev,next" : "", // will normally be on the right. if RTL, will be on the left
          }}
          buttonText={{
            today: "今天",
            month: "月",
            multiMonthPlugin: "年",
          }}
          datesSet={({ view }) => setCurrentView(view.type)}
          validRange={{
            //今年到明年
            start: new Date(new Date().getFullYear(), 0, 1),
            end: new Date(new Date().getFullYear() + 1, 11, 31),
          }}
          // eventMouseEnter={(arg) => {}}
          // eventMouseLeave={(arg) => {}}
          eventClick={(arg) => {
            arg.jsEvent.preventDefault();
            setCurrEvent((prev: any) =>
              prev === arg.event.id ? null : arg.event.id
            );
          }}
          dayCellClassNames={"w-fit h-fit"}
          dayHeaderClassNames={"w-fit h-fit"}
          dateClick={(arg) => setCurrEvent(null)}
          // hiddenDays={[1, 2, 4]}
        />
      </div>
    </div>
  );
}
