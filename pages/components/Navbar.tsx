import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { deleteCookie, getCookie } from "cookies-next";
import Link from "next/link";
import { message } from "antd";

const Nav = ({ data }: any) => {
  const [isLogin, setIsLogin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = getCookie("token");
    if (token) {
      setIsLogin(true);
    }
  }, []);

  const logout = async () => {
    deleteCookie("token");
    message.success("登出成功");
    setIsLogin(false);
  };

  const login = async () => {
    router.push("/login");
  };

  return (
    <nav>
      <div
        className="mb-10 flex justify-between items-center h-16 bg-white text-black relative shadow-sm font-mono"
        role="navigation"
      >
        <Link href="/">
          <h2 className="pl-8">Photo Pacer</h2>
        </Link>

        <div className="px-4 cursor-pointer md:hidden" id="burger">
          <svg
            className="w-8 h-8"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path className="fill-current text-black" d="M0 0h20v20H0z" />
            <path className="fill-current text-black" d="M0 0h20v20H0z" />
            <path className="fill-current text-black" d="M0 0h20v20H0z" />
          </svg>
        </div>
        <div className="flex items-center pr-8">
          <Link href="/user/shoppingCart">
            <div className="p-4">購物車</div>
          </Link>
          <Link href="/user/orders">
            <div className="p-4">訂單查詢</div>
          </Link>
          <Link href="/user/checkout">
            <div className="p-4">結帳</div>
          </Link>
          <Link href="/user/profile">
            <div className="p-4">會員資料</div>
          </Link>

          {isLogin ? (
            <button className="p-4" onClick={logout}>
              登出
            </button>
          ) : (
            <button className="p-4" onClick={login}>
              登入
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Nav;
