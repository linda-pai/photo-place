import { Divider } from "antd";
import dayjs from "dayjs";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-[color:var(--main-color-lighter)] py-16 mt-20">
      <div className="container mx-auto px-10">
        <div className="flex flex-wrap justify-between">
          {/* <div className="w-full lg:w-1/4">
            <h6 className="text-[color:var(--main-color)] text-lg font-bold mb-5">
              About Us
            </h6>
            <p className="text-[color:var(--main-color-light)] leading-loose">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam
              quod, quibusdam voluptatibus, voluptas quas, voluptates
            </p>
          </div> */}
          <div className="w-full lg:w-1/4">
            <h6 className="text-[color:var(--main-color)] text-lg font-bold mb-5">
              Photo Pacer
            </h6>
            <ul className="text-[color:var(--main-color-light)]">
              {/* <li>
                <a
                  href="#"
                  className="hover:text-teal-600 transition duration-150 ease-in-out"
                >
                  About Us
                </a>
              </li> */}

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
          <div className="w-full lg:w-1/4">
            <h6 className="text-[color:var(--main-color)] text-lg font-bold mb-5">
              社群媒體
            </h6>
            <ul className="text-[color:var(--main-color-light)]">
              <li>
                <a
                  href="https://www.facebook.com/profile.php?id=61554260632079"
                  className="hover:text-teal-600 transition duration-150 ease-in-out"
                  target="_blank"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/photopacer/"
                  className="hover:text-teal-600 transition duration-150 ease-in-out"
                  target="_blank"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://lin.ee/n4xOm2O"
                  className="hover:text-teal-600 transition duration-150 ease-in-out"
                  target="_blank"
                >
                  Line
                </a>
              </li>
            </ul>
          </div>
          <div className="w-full lg:w-1/4">
            <h6 className="text-[color:var(--main-color)] text-lg font-bold mb-5">
              客服資訊
            </h6>
            <ul className="text-[color:var(--main-color-light)]">
              <li>客服信箱：photopacer@gmail.com</li>
              <li>服務時間：週一至週日 8:30 - 21:00</li>
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
