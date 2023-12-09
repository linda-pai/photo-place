import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { message, Dropdown } from "antd";
import { ShoppingCartOutlined, UserOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useSession, signOut } from "next-auth/react";

const Nav = ({ navBarRef }: any) => {
  const router = useRouter();
  const [showLightColor, setShowLightColor] = useState(false);

  const observerRef = useRef<any>();

  const routerPath = router.pathname;

  const { data: session } = useSession();

  useEffect(() => {
    observerRef.current = new IntersectionObserver(([entry]) =>
      setShowLightColor(entry.isIntersecting)
    );
  }, [routerPath]);

  useEffect(() => {
    if (!navBarRef.current) return setShowLightColor(false);
    observerRef.current.observe(navBarRef.current);
    return () => {
      observerRef.current.disconnect();
    };
  }, [navBarRef, routerPath]);

  const logout = async () => {
    signOut();
    message.success("登出成功");
  };

  const login = async () => {
    router.push("/auth/signIn");
  };

  const items: MenuProps["items"] = [
    {
      key: "2",
      label: "訂單查詢",
      onClick: () => {
        router.push("/user/orders");
      },
    },
    {
      key: "3",
      label: "登出",
      onClick: () => logout(),
    },
  ];

  return (
    <nav
      className={
        `${
          showLightColor
            ? "text-white"
            : "bg-[#ffffffa7] text-[color:var(--main-color)]"
        }` + " h-16 fixed top-0 z-10 w-full shadow-sm flex items-center"
      }
    >
      <div
        className="container mx-auto sm:px-0 px-4 flex justify-between items-center font-mono"
        role="navigation"
      >
        <Link href="/" className="w-[12%] min-w-[100px]">
          {showLightColor ? (
            <img src="/photo-pacer-white.png" alt="photopacer-logo" />
          ) : (
            <img src="/photo-pacer.png" alt="photopacer-logo" />
          )}
        </Link>

        <div className="flex items-center gap-5">
          <Link href="/user/shoppingCart">
            <div className="text-2xl hover:text-[#ca7c6f]">
              <ShoppingCartOutlined />
            </div>
          </Link>

          {session ? (
            <div className="cursor-pointer">
              <Dropdown menu={{ items }} placement="bottom">
                <div className=" text-2xl hover:text-[#ca7c6f]">
                  <UserOutlined />
                </div>
              </Dropdown>
            </div>
          ) : (
            <button className="" onClick={login}>
              登入
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Nav;
