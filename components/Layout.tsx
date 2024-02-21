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
        <meta property="og:site_name" content="Photo Pacer 攝影小隊" />
        <meta
          property="og:image"
          content="https://photo-pacer-buckets.s3.ap-northeast-1.amazonaws.com/images/common/182cba33f2b4387b34d881fa32e37533cc18e9669c1304f99dddfd29123b6297-S__50266122.jpg"
        />
        <meta property="og:url" content="https://www.photopacer.com" />
        <meta
          name="Keywords"
          content="photopacer, photo pacer, 攝影小隊, 馬拉松照片, 找照片, 買照片, 賣照片, 活動照片, 運動賽事照片, 照片平台, 賽事照片"
        />
        <meta
          name="search_keywords"
          content="photopacer, photo pacer, 攝影小隊, 馬拉松照片, 找照片, 買照片, 賣照片, 活動照片, 運動賽事照片, 照片平台, 賽事照片"
        />
        <meta
          name="keywords"
          content="photopacer, photo pacer, 攝影小隊, 馬拉松照片, 找照片, 買照片, 賣照片, 活動照片, 運動賽事照片, 照片平台, 賽事照片"
        />
        <meta property="og:locale" content="zh_TW" />
        <link
          rel="icon"
          href="https://www.photopacer.com/favicon.ico"
          sizes="96x96"
        />
        <meta charSet="utf-8" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <meta name="author" content="PhotoPacer攝影小隊" />
        <meta name="publisher" content="PhotoPacer攝影小隊" />
        <meta name="owner" content="PhotoPacer攝影小隊" />
        <meta name="robots" content="index, follow" />
        <meta name="spiders" content="all" />
        <meta name="webcrawlers" content="all" />
        <meta name="rating" content="general" />
        <meta name="abstract" content={metadata.description} />
        <meta name="reply-to" content="photopacer@gmail.com" />
        <meta name="contact" content="photopacer@gmail.com" />
        <meta itemProp="name" content="Photo Pacer 攝影小隊 / 照片平台" />
        <meta
          itemProp="image"
          content="https://photo-pacer-buckets.s3.ap-northeast-1.amazonaws.com/images/common/182cba33f2b4387b34d881fa32e37533cc18e9669c1304f99dddfd29123b6297-S__50266122.jpg"
        />
      </Head>
      <Navbar navBarRef={navBarRef} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
