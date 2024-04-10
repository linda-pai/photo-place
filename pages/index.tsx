import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
import Head from "next/head";
import { Spin } from "antd";

const EventCard = dynamic(() => import("@/components/EventCard"), {
  loading: () => <Spin />,
});

const inter = Inter({ subsets: ["latin"] });

interface Event {
  data: string;
  eventName: string;
  coverImg: string;
  userId: string;
  isShow: boolean;
  eventId: string;
}

export default function Home({ events }: { events: Event[] }) {
  return (
    <>
      <Head>
        <title>Photo Pacer 攝影小隊 - 首頁</title>
        <meta property="og:title" content={`Photo Pacer 攝影小隊 - 首頁`} />
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_APP_URL}`} />
      </Head>
      <div
        className={`flex flex-col items-center justify-between my-24 container mx-auto ${inter.className}`}
      >
        <h1 className="my-6 border-b text-2xl text-[color:var(--main-color-dark)]">
          運動賽事照片
        </h1>
        <div className="max-w-[1280px] flex flex-wrap justify-center">
          {events.map(
            (event, key) =>
              event.isShow && <EventCard key={key} event={event} />
          )}
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(context: any) {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  // Fetch data from external API
  const res = await fetch(`${domain}/api/events?sort=desc`);
  const events = await res.json();

  const { token } = context.req.cookies;
  if (!token) return { props: { events } };

  const resUser = await fetch(`${domain}/api/user/getUserInfo/${token}`)
    .then((res) => res.json())
    .catch((err) => console.log(err));

  // Pass data to the page via props
  return { props: { events, userInfo: resUser || {} } };
}
