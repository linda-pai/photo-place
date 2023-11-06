import Image from "next/image";
import { Inter } from "next/font/google";
import EventCard from "@/pages/components/EventCard";
import Nav from "@/pages/components/Nav";
import jwt from "jsonwebtoken";

const inter = Inter({ subsets: ["latin"] });

interface Event {
  id: number;
  date: string;
  eventName: string;
  coverImg: string;
}

export default function Home({
  events,
  userInfo,
}: {
  events: Event[];
  userInfo: any;
}) {
  console.log("events", events);
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-10 container mx-auto ${inter.className}`}
    >
      <Nav userInfo={userInfo} />
      <h2 className="mb-6">Brand Name</h2>
      <div className="flex flex-wrap">
        {events.map((event, key) => (
          <EventCard key={key} event={event} />
        ))}
      </div>
    </main>
  );
}

export async function getServerSideProps(context: any) {
  // Fetch data from external API
  const res = await fetch("http://localhost:3001/api/events");
  const events = await res.json();

  const { token } = context.req.cookies;

  if (!token) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const verifiedToken = await jwt.verify(
    token,
    process.env.NEXT_PUBLIC_JWT_SECRET
  );
  console.log("verifiedToken", verifiedToken);

  const resUser = await fetch(
    `http://localhost:3001/user/getUserInfo/${token}`
  ).then((res) => res.json());

  // Pass data to the page via props
  return { props: { events, userInfo: resUser[0] } };
}
