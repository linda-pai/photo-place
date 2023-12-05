import { Inter } from "next/font/google";
import dynamic from "next/dynamic";

const EventCard = dynamic(() => import("@/pages/components/EventCard"), {
  ssr: false,
});

const inter = Inter({ subsets: ["latin"] });

interface Event {
  eventId: number;
  date: string;
  eventName: string;
  coverImg: string;
}

export default function Home({ events }: { events: Event[] }) {
  return (
    <div
      className={`flex flex-col items-center justify-between my-24 container mx-auto ${inter.className}`}
    >
      <h3 className="my-6 border-b text-2xl text-[color:var(--main-color-dark)]">
        各大賽事
      </h3>
      <div className="flex flex-wrap justify-center">
        {events.map((event, key) => (
          <EventCard key={key} event={event} />
        ))}
      </div>
    </div>
  );
}

export async function getServerSideProps(context: any) {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;

  console.log("NEXT_PUBLIC_TEST", process.env.NEXT_PUBLIC_TEST);
  // Fetch data from external API
  const res = await fetch(`${domain}/api/events`);
  const events = await res.json();

  const { token } = context.req.cookies;
  if (!token) return { props: { events } };

  // if (!token) {
  //   return {
  //     redirect: {
  //       destination: "/login",
  //       permanent: false,
  //     },
  //   };
  // }

  // const verifiedToken = await jwt.verify(
  //   token,
  //   process.env.NEXT_PUBLIC_JWT_SECRET
  // );
  // console.log("verifiedToken", verifiedToken);

  const resUser = await fetch(`${domain}/api/user/getUserInfo/${token}`)
    .then((res) => res.json())
    .catch((err) => console.log(err));

  // Pass data to the page via props
  return { props: { events, userInfo: resUser || {} } };
}
