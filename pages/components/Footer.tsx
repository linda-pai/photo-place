const Footer = () => {
  return (
    <footer className="bg-gray-800 py-20 mt-20">
      <div className="container mx-auto px-10">
        <div className="flex flex-wrap justify-between">
          <div className="w-full lg:w-1/4">
            <h6 className="text-lg font-bold mb-5">About Us</h6>
            <p className="text-gray-500 leading-loose">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam
              quod, quibusdam voluptatibus, voluptas quas, voluptates
              consequuntur fugiat doloribus autem doloremque voluptatum
              voluptatem? Quia, quibusdam. Quisquam quod, quibusdam
              voluptatibus, voluptas quas, voluptates consequuntur fugiat
              doloribus autem doloremque voluptatum voluptatem? Quia, quibusdam.
            </p>
          </div>
          <div className="w-full lg:w-1/4">
            <h6 className="text-lg font-bold mb-5">Company</h6>
            <ul>
              <li>
                <a
                  href="#"
                  className="text-gray-500 hover:text-teal-600 transition duration-150 ease-in-out"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-500 hover:text-teal-600 transition duration-150 ease-in-out"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-500 hover:text-teal-600 transition duration-150 ease-in-out"
                >
                  Press
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-500 hover:text-teal-600 transition duration
                -150 ease-in-out"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-500 hover:text-teal-600 transition duration-150 ease-in-out"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
          <div className="w-full lg:w-1/4">
            <h6 className="text-lg font-bold mb-5">Social</h6>
            <ul>
              <li>
                <a
                  href="#"
                  className="text-gray-500 hover:text-teal-600 transition duration-150 ease-in-out"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-500 hover:text-teal-600 transition duration-150 ease-in-out"
                >
                  Linkedin
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-500 hover:text-teal-600 transition duration-150 ease-in-out"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-500 hover:text-teal-600 transition duration-150 ease-in-out"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
          <div className="w-full lg:w-1/4">
            <h6 className="text-lg font-bold mb-5">Newsletter</h6>
            <p className="text-gray-500 leading-loose">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam
              quod, quibusdam voluptatibus, voluptas quas, voluptates
              consequuntur fugiat doloribus autem doloremque voluptatum
              voluptatem? Quia, quibusdam.
            </p>
            <form className="mt-6">
              <input
                type="text"
                className="bg-gray-800 px-4 py-2 border border-gray-700 focus:outline-none focus:border-teal-500 transition duration-150 ease-in-out text-gray-500 rounded-full"
                placeholder="Your email address"
              />
              <button className="bg-teal-500 hover:bg-teal-600 transition duration-150 ease-in-out ml-2 px-4 py-2 rounded-full">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
