import { useEffect, useState } from "react";
import { Checkbox, Divider, Button, Spin } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import Link from "next/link";
import { CartDataProps } from "@/types/interfaces/CartDataProps";

const shoppingCart = () => {
  const [cartData, setCartData] = useState([]);
  const [checkedList, setCheckedList] = useState<CartDataProps[]>([]);

  useEffect(() => {
    const session = JSON.parse(sessionStorage.getItem("cart") || "{}");

    if (!session) return;
    Object.keys(session).forEach((key) => {
      const eventId = key;
      const ids = session[key];
      if (!ids.length) return;
      fetch(`http://localhost:3001/api/images/getByIds/${eventId}/${ids}`)
        .then((res) => res.json())
        .then((data) => {
          const flattenData = data.map((item: any) => item.images).flat();
          setCartData(flattenData);
        });
    });
  }, []);

  const handleRemoveFromCart = (id: string) => {
    const currentCart = JSON.parse(sessionStorage.getItem("cart") || "{}");
    const eventId = Object.keys(currentCart).find((key) =>
      currentCart[key].includes(id)
    );
    if (!eventId) return;
    const newCart = currentCart[eventId].filter((item: string) => item !== id);
    currentCart[eventId] = newCart;
    sessionStorage.setItem("cart", JSON.stringify(currentCart));

    setCartData(cartData.filter((item: CartDataProps) => item.id !== id));
  };

  const checkAll = cartData.length === checkedList.length;

  console.log("checkedList", checkedList);

  const onChange = (e: CheckboxChangeEvent) => {
    const removedData = checkedList.filter(
      (item: any) => item !== e.target.value
    );
    setCheckedList(
      e.target.checked ? [...checkedList, e.target.value] : removedData
    );
  };

  const onCheckAllChange = (e: CheckboxChangeEvent) => {
    setCheckedList(e.target.checked ? cartData : []);
  };

  const handleOnSubmit = () => {
    sessionStorage.setItem("checkoutData", JSON.stringify(checkedList));
  };

  const total = checkedList
    .map((item) => Number(item.price))
    .reduce((a, b) => a + b, 0);

  return (
    <div className="container mx-auto my-10">
      <h1 className="text-center text-2xl mb-20">shoppingCart</h1>

      <Checkbox onChange={onCheckAllChange} checked={checkAll}>
        Check all
      </Checkbox>
      <Divider />

      <div className="flex flex-row  items-center">
        {cartData.length > 0 ? (
          cartData.map((image: any, key: number) => (
            <Checkbox
              onChange={onChange}
              checked={checkAll || checkedList.includes(image)}
              value={image}
              className="hover:bg-gray-300 p-6"
              key={key}
            >
              <div className="basis-3/12 max-w-[300px]">
                <img src={image.watermarkedUrl} className="m-4" />
              </div>
              <div className="basis-3/12 text-center">
                <p>TWD {image.price} 元</p>
              </div>
              <div className="basis-3/12 text-center">
                <button
                  className="cursor-pointer w-[48px] h-[48px]"
                  onClick={() => handleRemoveFromCart(image.id)}
                >
                  <div>移除</div>
                  <DeleteOutlined
                    style={{ fontSize: "32px", color: "#fa5e52" }}
                  />
                </button>
              </div>
            </Checkbox>
          ))
        ) : (
          <div className="text-center w-full text-slate-500">
            你的購物車是空的
          </div>
        )}
      </div>

      <Divider />
      <div className="text-end mr-20">
        <p>總金額：TWD {total} 元</p>
      </div>
      <div className="text-center mt-10">
        <Button>
          <Link href="/user/checkout" onClick={handleOnSubmit}>
            選擇付款方式
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default shoppingCart;

export const getServerSideProps = async (context: any) => {
  const previousUrl = context.req.headers.referer;
  const isLogin = context.req.cookies["token"];

  if (!isLogin) {
    return {
      redirect: {
        destination: `/login?previousUrl=${previousUrl}`,
        permanent: false,
      },
    };
  } else {
    return {
      props: {},
    };
  }
};
