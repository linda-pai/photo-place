import Image from "next/image";
import { Inter } from "next/font/google";
import EventCard from "@/pages/components/EventCard";

const inter = Inter({ subsets: ["latin"] });

const events = [
  {
    id: "1",
    name: "string",
    description: "2023長榮馬拉松測試更長的活動名稱測試更長",
    date: "20231022",
    location: "Taipei",
    image:
      "https://cdn.pixabay.com/photo/2023/08/27/00/08/cycling-8215968_1280.jpg",
  },
  {
    id: "2",
    name: "string",
    description: "2023長榮馬拉松測試更長的活動名稱測試更長",
    date: "20231022",
    location: "Taipei",
    image:
      "https://cdn.pixabay.com/photo/2017/08/24/21/41/tartan-track-2678544_1280.jpg",
  },
  {
    id: "3",
    name: "string",
    description: "2023長榮馬拉松測試更長的活動名稱測試更長",
    date: "20231022",
    location: "Taipei",
    image:
      "https://cdn.pixabay.com/photo/2023/08/27/00/08/cycling-8215968_1280.jpg",
  },
  {
    id: "4",
    name: "string",
    description: "2023長榮馬拉松測試更長的活動名稱測試更長",
    date: "20231022",
    location: "Taipei",
    image:
      "https://cdn.pixabay.com/photo/2017/08/24/21/41/tartan-track-2678544_1280.jpg",
  },
  {
    id: "5",
    name: "string",
    description: "2023長榮馬拉松測試更長的活動名稱測試更長",
    date: "20231022",
    location: "Taipei",
    image:
      "https://cdn.pixabay.com/photo/2023/08/27/00/08/cycling-8215968_1280.jpg",
  },
  {
    id: "6",
    name: "string",
    description: "2023長榮馬拉松測試更長的活動名稱測試更長",
    date: "20231022",
    location: "Taipei",
    image:
      "https://cdn.pixabay.com/photo/2017/08/24/21/41/tartan-track-2678544_1280.jpg",
  },
];

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-10 container mx-auto ${inter.className}`}
    >
      <h2 className="mb-6">Brand Name</h2>
      <div className="flex flex-wrap">
        {events.map((event) => (
          <EventCard event={event} />
        ))}
      </div>
    </main>
  );
}
