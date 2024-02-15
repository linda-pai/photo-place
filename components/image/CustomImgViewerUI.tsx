import { ShoppingCartOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const customImgViewerUI = ({ image, isExistInCart, handleClickCart }: any) => {
  return (
    <>
      <div className="flex items-center gap-4 mx-auto m-4">
        <div>
          <p className="line-through text-xs text-[#8f8f8f]">TWD: 169</p>
          <p className="text-red-500 ">TWD: {image.price} </p>
        </div>
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
      {image.lastModified && (
        <p className="sm:text-xs text-[12px] text-[#8f8f8f] text-end mx-2">
          {dayjs(image.lastModified).format("YYYY/MM/DD HH:mm")}
        </p>
      )}
    </>
  );
};
export default customImgViewerUI;
