import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ children, navBarRef }: any) {
  return (
    <>
      <Navbar navBarRef={navBarRef} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
