import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { message, Dropdown } from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  DeploymentUnitOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useSession, signOut } from "next-auth/react";

const Nav = ({ navBarRef }: any) => {
  const router = useRouter();
  const [showLightColor, setShowLightColor] = useState(false);

  const observerRef = useRef<any>();

  const routerPath = router.pathname;

  const { data: session }: any = useSession();

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

  const photographerItems: any = session
    ? session.id === process.env.NEXT_PUBLIC_ADMIN_ID && [
        {
          key: "4",
          label: "攝影師上傳紀錄",
          onClick: () => {
            router.push("/photographer/records");
          },
        },
        {
          key: "5",
          label: "上傳照片",
          onClick: () => {
            router.push("/uploadService");
          },
        },
      ]
    : [];

  const basicItems: MenuProps["items"] = [
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

  //photographerItems ＋ basicItems
  const UserItems: MenuProps["items"] = basicItems.concat(photographerItems);

  const adminItems: MenuProps["items"] = [
    {
      key: "2",
      label: "訂單管理",
      onClick: () => {
        router.push("/cms/orderList");
      },
    },
    {
      key: "3",
      label: "通知管理",
      onClick: () => {
        router.push("/cms/notify");
      },
    },
    {
      key: "4",
      label: "賽事管理",
      onClick: () => {
        router.push("/cms/eventManagement");
      },
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
        className="container mx-auto px-4 flex justify-between items-center font-mono"
        role="navigation"
      >
        <Link href="/" className="w-[12%] min-w-[100px]">
          {showLightColor ? (
            <img
              src="/photo-pacer-white.svg"
              alt="photopacer-logo"
              width="100%"
              height="100%"
            />
          ) : (
            <img
              src="/photo-pacer.svg"
              alt="photopacer-logo"
              width="100%"
              height="100%"
            />
          )}
        </Link>

        <div className="flex items-center gap-5">
          <Link href="/user/shoppingCart">
            <div className="text-3xl hover:text-[#ca7c6f]">
              <ShoppingCartOutlined />
            </div>
          </Link>

          {session ? (
            <>
              <div className="cursor-pointer">
                <Dropdown menu={{ items: UserItems }} placement="bottom">
                  <div className=" text-3xl hover:text-[#ca7c6f]">
                    <UserOutlined />
                  </div>
                </Dropdown>
              </div>
              {session.id == process.env.NEXT_PUBLIC_ADMIN_ID && (
                <div className="cursor-pointer">
                  <Dropdown menu={{ items: adminItems }} placement="bottom">
                    <div className=" text-3xl hover:text-[#ca7c6f]">
                      <DeploymentUnitOutlined />
                    </div>
                  </Dropdown>
                </div>
              )}
            </>
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
