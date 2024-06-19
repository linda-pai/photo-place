import { useState } from "react";
import { QuestionCircleOutlined } from "@ant-design/icons";

interface Props {
  handleOnChange: (e: any) => void;
  onSearch: () => void;
  eventName?: string;
  search: string;
}

const SearchWrapper = ({
  handleOnChange,
  onSearch,
  eventName,
  search,
}: Props) => {
  const [showHelp, setShowHelp] = useState(true);
  return (
    <div className="mb-10">
      <div className="relative w-full h-screen bg-cover bg-[url('/banner.png')]">
        <div className="rounded-tl-3xl rounded-br-3xl bg-[#ffffff5e] w-[90%] outline outline-2 outline-white outline-offset-[-10px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-full max-w-[800px] absolute mt-4 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <h1 className="sm:hidden block text-white sm:text-3xl text-xl font-bold text-center w-[90%] mx-auto my-3 pl-4 drop-shadow-lg ">
              {eventName}
            </h1>

            <div className="relative w-[90%] mx-auto">
              <input
                type="search"
                className="sm:block hidden w-full rounded-full h-[60px] py-3 sm:px-16 pl-16 pr-0 border border-white bg-[#5f5b50] bg-opacity-70 text-white sm:text-lg text-sm backdrop-blur-[2px]"
                placeholder={`${eventName}  - 請輸入號碼布`}
                onChange={handleOnChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onSearch();
                  }
                }}
                value={search}
              />
              <input
                type="search"
                className="sm:hidden block w-full rounded-full h-[60px] py-3 sm:px-16 pl-16 pr-0 border border-white bg-[#5f5b50] bg-opacity-70 text-white sm:text-lg text-sm backdrop-blur-[2px]"
                placeholder={`請輸入號碼布`}
                onChange={handleOnChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onSearch();
                  }
                }}
              />
              <div className="absolute top-0 left-6 h-[60px] flex items-center justify-center">
                <img
                  src="/searchIcon.svg"
                  height={32}
                  width={32}
                  alt="search-icon"
                />
              </div>
              <button
                onClick={onSearch}
                className="absolute right-1 top-0 h-[60px]"
              >
                <h3 className="h-[80%] bg-white text-[color:var(--main-color-dark)] sm:text-lg text-sm px-6 mx-1 rounded-full flex items-center justify-center">
                  搜尋號碼布
                </h3>
              </button>

              <div
                className="flex items-center w-fit text-white text-center text-sm mt-2 py-1 px-2 rounded-md bg-[#5f5b50] bg-opacity-70 w-fit max-w-[90%] mx-auto cursor-pointer"
                onClick={() => setShowHelp((prev) => !prev)}
              >
                <QuestionCircleOutlined />
                <div
                  className={`${
                    showHelp ? "w-full ml-1 max-h-10" : "w-0 max-h-5"
                  } transition-all duration-200 ease-in-out overflow-hidden sm:max-h-5 max-h-10`}
                >
                  <p>
                    接力賽號碼布輸入數字部分即可 ex: 123-1 只需輸入 1231 或 123
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchWrapper;
