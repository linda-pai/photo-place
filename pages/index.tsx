import { Inter } from "next/font/google";
import EventCard from "@/pages/components/EventCard";

const inter = Inter({ subsets: ["latin"] });

interface Event {
  id: number;
  date: string;
  eventName: string;
  coverImg: string;
}

export default function Home({ events }: { events: Event[] }) {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between my-24 container mx-auto ${inter.className}`}
    >
      <h3 className="my-6 border-b text-2xl text-[color:var(--main-color-dark)]">
        各大賽事
      </h3>
      <div className="flex flex-wrap">
        {events.map((event, key) => (
          <EventCard key={key} event={event} />
        ))}
      </div>
    </main>
  );
}

export async function getServerSideProps(context: any) {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  // Fetch data from external API
  console.log("domain", domain);
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

  const resUser = await fetch(`${domain}/user/getUserInfo/${token}`).then(
    (res) => res.json()
  );

  // Pass data to the page via props
  return { props: { events, userInfo: resUser || {} } };
}
