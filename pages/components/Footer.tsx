import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-[color:var(--main-color-lighter)] py-20 mt-20">
      <div className="container mx-auto px-10">
        <div className="flex flex-wrap justify-between">
          <div className="w-full lg:w-1/4">
            <h6 className="text-[color:var(--main-color)] text-lg font-bold mb-5">
              About Us
            </h6>
            <p className="text-[color:var(--main-color-light)] leading-loose">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam
              quod, quibusdam voluptatibus, voluptas quas, voluptates
            </p>
          </div>
          <div className="w-full lg:w-1/4">
            <h6 className="text-[color:var(--main-color)] text-lg font-bold mb-5">
              Company
            </h6>
            <ul className="text-[color:var(--main-color-light)]">
              <li>
                <a
                  href="#"
                  className="hover:text-teal-600 transition duration-150 ease-in-out"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-teal-600 transition duration-150 ease-in-out"
                >
                  Blog
                </a>
              </li>
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
              <li>
                <a
                  href="#"
                  className="hover:text-teal-600 transition duration-150 ease-in-out"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
          <div className="w-full lg:w-1/4">
            <h6 className="text-[color:var(--main-color)] text-lg font-bold mb-5">
              Social
            </h6>
            <ul className="text-[color:var(--main-color-light)]">
              <li>
                <a
                  href="#"
                  className=" hover:text-teal-600 transition duration-150 ease-in-out"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-teal-600 transition duration-150 ease-in-out"
                >
                  Linkedin
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-teal-600 transition duration-150 ease-in-out"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-teal-600 transition duration-150 ease-in-out"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
          <div className="w-full lg:w-1/4">
            <h6 className="text-[color:var(--main-color)] text-lg font-bold mb-5">
              Newsletter
            </h6>
            <p className="text-[color:var(--main-color-light)] leading-loose">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam
              quod, quibusdam voluptatibus, voluptas quas, voluptates
              consequuntur fugiat doloribus autem doloremque voluptatum
              voluptatem? Quia, quibusdam.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
