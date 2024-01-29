import { ShoppingCartOutlined } from "@ant-design/icons";

const customImgViewerUI = ({ image, isExistInCart, handleClickCart }: any) => {
  return (
    <div className="flex items-center gap-4 mx-auto m-4">
      <div>
        <p className="line-through text-xs text-[#8f8f8f]">TWD: 169</p>
        <p className="text-red-500 ">TWD: 109 </p>
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
  );
};
export default customImgViewerUI;
