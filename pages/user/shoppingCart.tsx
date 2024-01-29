import { useEffect, useState } from "react";
import { Button, Table, Space, Spin } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import dynamic from "next/dynamic";
import { setCookie, getCookie } from "cookies-next";
import { CartDataProps } from "@/types/interfaces/CartDataProps";
import useAuth from "@/hooks/useAuth";

interface CardDataProps {
  eventId: number;
  watermarkedUrl: string;
  id: string;
  price: number;
}

const ImageLightBox = dynamic(() => import("@/components/image/ImageLightBox"));

const shoppingCart = () => {
  const isLogin = useAuth();
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;

  const [cartData, setCartData] = useState([] as any);
  const [selectedRows, setSelectedRows] = useState([] as any);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currImg, setCurrImg] = useState(0); // [0, images.length - 1

  const columns: ColumnsType<CardDataProps> = [
    {
      title: "活動名稱",
      dataIndex: "eventName",
      key: "eventName",
      width: 120,
    },
    {
      title: "預覽",
      dataIndex: "watermarkedUrl",
      key: "watermarkedUrl",
      width: 100,
      render: (url: string, record) => (
        <div
          className="item cursor-pointer scale-100 hover:scale-105 transition-all duration-300 max-w-[100px]"
          key={record.id}
          onClick={() => handleClickImg(record.id)}
        >
          <img className="item__content" src={url} alt={record.id} />
        </div>
      ),
    },

    {
      title: "價格",
      dataIndex: "price",
      key: "price",
      width: 80,
      render: (price: number) => <p className="max-w-[80px]">TWD {price} 元</p>,
    },
    {
      title: "",
      key: "action",
      width: 80,
      render: (_, record) => (
        <Space size="middle">
          <Button
            danger
            onClick={() => handleRemoveFromCart(record.id)}
            className="flex items-center"
          >
            <DeleteOutlined />
            <p className="sm:block hidden">&nbsp;移除</p>
          </Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    const session = JSON.parse(getCookie("cart") || "{}");

    if (!session) return;
    Object.keys(session).forEach((key) => {
      const eventId = key;
      const ids = session[key];
      if (!ids.length) return;
      fetch(`${domain}/api/images/getByIds/${eventId}/${ids}`)
        .then((res) => res.json())
        .then((data) => {
          setCartData((prevData: any) => [...prevData, ...data]);
          setSelectedRows((prevData: any) => [...prevData, ...data]);
        });
    });
  }, []);

  const handleRemoveFromCart = (id: string) => {
    const currentCart = JSON.parse(getCookie("cart") || "{}");
    const eventId = Object.keys(currentCart).find((key) =>
      currentCart[key].includes(id)
    );
    if (!eventId) return;
    const newCart = currentCart[eventId].filter((item: string) => item !== id);
    currentCart[eventId] = newCart;
    setCookie("cart", JSON.stringify(currentCart), {
      expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    });

    setCartData(cartData.filter((item: CartDataProps) => item.id !== id));
    setSelectedRows(
      selectedRows.filter((item: CartDataProps) => item.id !== id)
    );
  };

  const handleOnSubmit = () => {
    setCookie("checkoutData", JSON.stringify(selectedRows), {
      expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    });
  };

  const total = selectedRows
    .map((item: CardDataProps) => Number(item.price))
    .reduce((a: number, b: number) => a + b, 0);

  const handleClickImg = (id: string) => {
    setShowImageViewer(true);
    setCurrImg(cartData.findIndex((item: any) => item.id === id));
  };

  const rowSelection = {
    onChange: (keys: React.Key[], rows: CardDataProps[]) =>
      setSelectedRows(rows),
    selectedRowKeys: selectedRows.map((item: CardDataProps) => item.id),
  };

  const gotoPrevious = () => {
    setCurrImg(currImg - 1);
  };
  const gotoNext = () => {
    currImg + 1 < cartData.length && setCurrImg(currImg + 1);
  };

  return isLogin ? (
    <div className="container sm:px-4 px-0 mx-auto my-24 text-[color:var(--main-color-dark)]">
      <h1 className="text-center text-2xl mb-4">購物車</h1>
      <Table
        dataSource={cartData}
        columns={columns}
        className="sm:mx-0 mx-4 my-16"
        pagination={false}
        rowSelection={rowSelection}
      />
      <div className="my-4 text-center">
        <p className="text-[color:var(--main-color-dark)] my-3">
          共 {selectedRows.length} 張，總金額：TWD {total} 元
        </p>
        <Button
          disabled={selectedRows.length === 0}
          className="bg-[color:var(--main-color-dark)] text-white hover:bg-[color:var(--main-color-dark-hover)] hover:border-[color:var(--main-color-dark-hover)] transition-all duration-300"
        >
          <Link href="/user/checkout" onClick={handleOnSubmit}>
            前往結帳
          </Link>
        </Button>
      </div>

      <ImageLightBox
        images={cartData}
        isOpen={showImageViewer}
        onClose={() => setShowImageViewer(false)}
        curIndex={currImg}
        onPrev={gotoPrevious}
        onNext={gotoNext}
      />
    </div>
  ) : (
    <Spin className="mx-auto my-[40vh] w-full" size="large" />
  );
};

export default shoppingCart;
