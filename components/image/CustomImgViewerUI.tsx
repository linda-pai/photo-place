import { ShoppingCartOutlined, FlagOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const customImgViewerUI = ({
  image,
  isExistInCart,
  handleClickCart,
  handleClickReport,
}: any) => {
  return (
    <div className="flex justify-between sm:gap-24 gap-4 mb-2 max-w-[100%] sm:mx-auto mx-4">
      <div>
        {image?.authorName && (
          <p className="text-sm text-[#8f8f8f] sm:m-1 m-0">
            photo by {image?.authorName}
          </p>
        )}
        {image.lastModified && (
          <p className="sm:text-sm text-[12px] text-[#8f8f8f] sm:m-1 m-0">
            {dayjs(image.lastModified).format("YYYY/MM/DD HH:mm")}
          </p>
        )}
      </div>
      <div className="flex items-center gap-4 mt-2">
        <div>
          <p className="line-through text-xs text-[#8f8f8f]">TWD: 169</p>
          <p className="text-red-500 ">TWD: {image.price} </p>
        </div>
        <button
          onClick={() => handleClickReport(image?.id)}
          className="cursor-pointer"
        >
          <FlagOutlined className={`sm:text-[24px] text-4xl text-white`} />
          <p className={`text-xs hidden sm:block text-white`}>檢舉</p>
        </button>
        <button
          onClick={() => handleClickCart(image?.id)}
          className="cursor-pointer"
        >
          <ShoppingCartOutlined
            className={`sm:text-[24px] text-4xl ${
              isExistInCart(image?.id)
                ? "text-[color:var(--main-color)]"
                : "text-white"
            }`}
          />
          <p
            className={`text-xs hidden sm:block ${
              isExistInCart(image?.id)
                ? "text-[color:var(--main-color)]"
                : "text-white"
            }`}
          >
            {isExistInCart(image?.id) ? "已加入購物車" : "加入購物車"}
          </p>
        </button>
      </div>
    </div>
  );
};
export default customImgViewerUI;
