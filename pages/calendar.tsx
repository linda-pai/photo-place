import dynamic from "next/dynamic";
import Head from "next/head";
import { SITE_NAME } from "@/constants";

const Calendar = dynamic(() => import("@/components/calendar/FullCalendar"), {
  ssr: false,
});

export default function Calender({ eventList }: { eventList: any }) {
  const name = "全國賽事列表 | 賽事行事曆";
  return (
    <>
      <Head>
        <title>{`${name} | ${SITE_NAME}`}</title>
        <meta
          property="og:title"
          content={`全國賽事列表 | 馬拉松賽事 | 自行車賽事 | 三鐵賽事| ${SITE_NAME}`}
        />
        <meta name="description" content={`${name}`} />
        <meta property="og:description" content={`${name}`} />
        <meta
          property="og:image"
          content="https://photo-pacer-buckets.s3.ap-northeast-1.amazonaws.com/images/common/182cba33f2b4387b34d881fa32e37533cc18e9669c1304f99dddfd29123b6297-S__50266122.jpg"
        />
        <meta
          property="og:url"
          content={`${process.env.NEXT_PUBLIC_APP_URL}/calender`}
        />
        <meta itemProp="name" content={`${name}`} />
        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_APP_URL}/calender`}
        />
      </Head>
      <div className="container my-24 text-slate-600 mx-auto">
        <h1 className="text-center text-2xl mb-3">全國賽事行事曆</h1>
        <p className="text-center text-sm mb-12">
          賽事資訊以主辦單位公告為主，以下資訊僅供參考。
        </p>
        <Calendar events={eventList} />
      </div>
    </>
  );
}

export async function getServerSideProps(context: any) {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  // Fetch data from external API
  const res = await fetch(`${domain}/api/events/getAllEvents`);
  const events = await res.json();

  const eventList: any = events.map((event: any) => {
    return {
      id: event.eventId,
      title: event.eventName,
      start: event.date,
      url: event?.url || "",
      allDay: true,
      backgroundColor: "#857e85",
      borderColor: "#857e85",
    };
  });

  return {
    props: { eventList },
  };
}
