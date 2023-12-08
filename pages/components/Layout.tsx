import Navbar from "./Navbar";
import Footer from "./Footer";
import Head from "next/head";

export const metadata = {
  title: "Photo Pacer 攝影小隊 - 馬拉松照片",
  description:
    "在您參與的馬拉松、自行車賽，或是其他各種運動活動中，Photo Pacer 攝影小隊將會在現場捕捉到最令人難忘的瞬間。我們的目標是透過專業攝影的照片，讓您的運動經歷得以永久保存，同時也讓其他熱愛運動的人們分享您的榮耀時刻。",
};

export default function Layout({ children, navBarRef }: any) {
  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Photo Pacer" />
        <meta
          property="og:image"
          content="https://photo-pacer-buckets.s3.ap-northeast-1.amazonaws.com/images/common/17ffc87d17d2b25f0517c6367ff2441163cbbf837178be5fe7ffae57e4427bcf-36a1511f7e9e805b6b059023852a2a68a225adbd919d6e2a0ec8aa95ff1be446-photo-pacer-high-resolution-logo%2B%284%29.png"
        />
        <meta
          name="keywords"
          content="photopacer, 攝影小隊, 馬拉松, 活動, 照片"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar navBarRef={navBarRef} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
