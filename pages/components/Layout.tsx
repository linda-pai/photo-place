import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ children, userInfo }: any) {
  const data = {
    links: [
      {
        title: "Home",
        href: "/",
      },
      {
        title: "About",
        href: "/about",
      },
      {
        title: "Contact",
        href: "/contact",
      },
    ],
  };
  return (
    <>
      <Navbar links={data.links} userInfo={userInfo} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
