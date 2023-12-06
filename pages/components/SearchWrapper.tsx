interface Props {
  handleOnChange: (e: any) => void;
  onSearch: () => void;
}

const SearchWrapper = ({ handleOnChange, onSearch }: Props) => {
  return (
    <div className="mb-10">
      <div className="relative w-full h-screen bg-cover bg-[url('/banner.png')]">
        <div className=" rounded-tl-3xl rounded-br-3xl bg-[#ffffff5e] w-[90%] outline outline-2 outline-white outline-offset-[-10px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-full max-w-[800px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="relative w-[90%] mx-auto">
              <input
                type="search"
                className="w-full rounded-full h-[60px] py-3 px-16 border border-white bg-white bg-opacity-30 text-white sm:text-lg text-sm backdrop-blur-[2px]"
                placeholder="請輸入號碼布"
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
                  alt="Follow us on Twitter"
                />
              </div>
              <button onClick={onSearch} className="absolute right-1 h-[60px]">
                <div className="h-[80%] bg-white text-[color:var(--main-color-dark)] sm:text-lg text-sm px-6 mx-1 rounded-full flex items-center justify-center">
                  搜尋號碼布
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchWrapper;
