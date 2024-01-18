import { ShoppingCartOutlined } from "@ant-design/icons";

const customImgViewerUI = ({ images, isExistInCart, handleClickCart }: any) => {
  return images.map((image: any, key: number) => {
    return {
      src: image.watermarkedUrl,
      caption: (
        <div className="flex gap-4">
          <button
            onClick={() => handleClickCart(image.id)}
            className="cursor-pointer"
          >
            <ShoppingCartOutlined
              className={`text-[24px] ${
                isExistInCart(image.id)
                  ? "text-[color:var(--main-color)]"
                  : "text-white"
              }`}
            />
            <p
              className={`text-xs ${
                isExistInCart(image.id)
                  ? "text-[color:var(--main-color)]"
                  : "text-white"
              }`}
            >
              {isExistInCart(image.id) ? "已加入購物車" : "加入購物車"}
            </p>
          </button>
          <div>
            <p className="line-through text-xs text-[#8f8f8f]">TWD: 169</p>
            <p className="text-red-500 ">TWD: 109 </p>
          </div>
        </div>
      ),
    };
  });
};
export default customImgViewerUI;
