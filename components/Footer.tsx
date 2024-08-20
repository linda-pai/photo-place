import { Divider } from "antd";
import dayjs from "dayjs";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-[color:var(--main-color-lighter)] py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between sm:gap-0 gap-6">
          <div className="w-full lg:w-1/5">
            <h6 className="text-[color:var(--main-color-dark)] text-lg font-bold mb-5">
              Photo Pacer 攝影小隊
            </h6>
            <ul className="text-[color:var(--main-color-light)]">
              <li>
                <Link
                  href="/policies/privacy-policy"
                  className="hover:text-teal-600 transition duration-150 ease-in-out"
                >
                  隱私權政策
                </Link>
              </li>
              <li>
                <Link
                  href="/policies/terms-of-use"
                  className="hover:text-teal-600 transition duration-150 ease-in-out"
                >
                  使用者條款
                </Link>
              </li>
            </ul>
          </div>
          <div className="w-full lg:w-1/6">
            <h6 className="text-[color:var(--main-color-dark)] text-lg font-bold mb-5">
              社群媒體
            </h6>
            <ul className="text-[color:var(--main-color-light)]">
              <li>
                <a
                  href="https://www.facebook.com/profile.php?id=61554260632079"
                  className="hover:text-teal-600 transition duration-150 ease-in-out"
                  target="_blank"
                  title="Facebook"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/photopacer/"
                  className="hover:text-teal-600 transition duration-150 ease-in-out"
                  target="_blank"
                  title="Instagram"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
          <div className="w-full lg:w-1/4">
            <h6 className="text-[color:var(--main-color-dark)] text-lg font-bold mb-5">
              客服資訊
            </h6>
            <ul className="text-[color:var(--main-color-light)]">
              <li>
                <a
                  href="https://lin.ee/n4xOm2O"
                  className="hover:text-teal-600 transition duration-150 ease-in-out"
                  target="_blank"
                  title="Line"
                >
                  加入攝影小隊官方 Line 帳號
                </a>
              </li>
              <li>客服信箱：photopacer@gmail.com</li>
              <li>服務時間：週一至週日 8:30 - 21:00</li>
            </ul>
          </div>
          <div className="w-full lg:w-1/6">
            <h6 className="text-[color:var(--main-color-dark)] text-lg font-bold mb-5">
              小工具
            </h6>
            <ul className="text-[color:var(--main-color-light)]">
              <li>
                <Link
                  href="/calendar"
                  className="hover:text-teal-600 transition duration-150 ease-in-out"
                >
                  賽事行事曆
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <Divider />
        <div className="w-full text-center text-[color:var(--main-color-light)]">
          <p className="text-sm">
            © {dayjs().year()} Photo Pacer. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
