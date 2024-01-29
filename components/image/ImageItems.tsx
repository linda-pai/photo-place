import Image from "next/image";
import { ShoppingCartOutlined } from "@ant-design/icons";

const ImageItems = ({
  item,
  isExistInCart,
  handleClickCart,
  handleClickImg,
}: any) => {
  const { id, watermarkedUrl } = item;

  return (
    <div
      className="sm:basis-[calc(20%_-_16px)] basis-[calc(33%_-_16px)] cursor-pointer scale-100 hover:scale-105 transition-all duration-300 group"
      key={id}
      onClick={() => handleClickImg(id)}
    >
      <Image
        className="item__content"
        src={watermarkedUrl}
        alt={watermarkedUrl}
        width={300}
        height={400}
        quality={20}
      />
      <div className="bg-[#fff] bg-opacity-70 absolute bottom-12 sm:p-2 p-1 leading-4 hidden group-hover:block">
        <p></p>
        <p className="line-through sm:text-xs text-[12px] text-[#8f8f8f] ">
          TWD: 169 元
        </p>
        <p className="text-red-500 sm:text-xs text-[12px]">TWD: 109 元</p>
      </div>
      <div
        className="bg-[#5f5b50] bg-opacity-70 absolute bottom-0 w-full sm:h-[10%] h-[18%] min-h-[28px] max-h-[34px] group hover:bg-opacity-90 transition-all duration-300"
        onClick={(e) => {
          e.stopPropagation();
          handleClickCart(id);
        }}
      >
        <div
          className={`z-20 text-xl absolute bottom-0 justify-evenly flex items-center w-full h-full hover:cursor-pointer hover:text-[color:var(--main-color)] ${
            isExistInCart(id) ? "text-[color:var(--main-color)]" : "text-white"
          }`}
        >
          <div className="flex items-center">
            <ShoppingCartOutlined />
            <p className="sm:text-sm  md:block hidden ml-1 h-fit">
              {isExistInCart(id) ? "已加入購物車" : "加入購物車"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageItems;
