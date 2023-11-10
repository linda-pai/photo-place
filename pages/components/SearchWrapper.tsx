interface Props {
  handleOnChange: (e: any) => void;
  onSearch: () => void;
}

const SearchWrapper = ({ handleOnChange, onSearch }: Props) => {
  return (
    <div className="mb-10">
      <div className="relative w-full h-[360px] bg-cover bg-[url('https://cdn.pixabay.com/photo/2023/08/27/00/08/cycling-8215968_1280.jpg')]">
        <div className="backdrop-blur-lg rounded-tl-3xl rounded-br-3xl bg-[#ffffff5e] h-[85%] w-[90%] outline outline-2 outline-white outline-offset-[-10px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-full max-w-[800px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="text-center text-3xl font-bold text-white mb-8">
              號碼布查詢
            </div>
            <div className="relative w-[70%] mx-auto">
              <input
                type="search"
                className="w-full rounded-full h-[60px] py-3 px-16 border-2 border-white bg-white bg-opacity-30 text-white text-lg"
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
                <div className="h-[80%] bg-[#30838d] text-white text-lg px-6 mx-1 rounded-full flex items-center justify-center">
                  Search
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
