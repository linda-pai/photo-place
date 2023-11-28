import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { deleteCookie, getCookie } from "cookies-next";
import Link from "next/link";
import { message, Dropdown } from "antd";
import { ShoppingCartOutlined, UserOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";

const Nav = ({ navBarRef }: any) => {
  const [isLogin, setIsLogin] = useState(false);
  const router = useRouter();
  const [showLightColor, setShowLightColor] = useState(false);

  const observerRef = useRef<any>();

  const routerPath = router.pathname;

  useEffect(() => {
    const token = getCookie("token");
    if (token) {
      setIsLogin(true);
    }
  }, []);

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
    deleteCookie("token");
    message.success("登出成功");
    router.reload();
  };

  const login = async () => {
    router.push("/login");
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
        className="container mx-auto flex justify-between items-center font-mono"
        role="navigation"
      >
        <Link href="/" className="w-[12%] min-w-[100px]">
          {showLightColor ? (
            <img src="/photo-pacer-white.png" />
          ) : (
            <img src="/photo-pacer.png" />
          )}
        </Link>

        {/* <div className="px-4 cursor-pointer md:hidden" id="burger">
          <svg
            className="w-8 h-8"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path className="fill-current text-black" d="M0 0h20v20H0z" />
            <path className="fill-current text-black" d="M0 0h20v20H0z" />
            <path className="fill-current text-black" d="M0 0h20v20H0z" />
          </svg>
        </div> */}
        <div className="flex items-center gap-5">
          <Link href="/user/shoppingCart">
            <div className="text-2xl hover:text-[#ca7c6f]">
              <ShoppingCartOutlined />
            </div>
          </Link>

          {isLogin ? (
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
