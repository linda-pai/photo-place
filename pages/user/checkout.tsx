import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Divider,
  Space,
  Radio,
  RadioChangeEvent,
  Button,
  message,
  Spin,
  Table,
  Tag,
  Modal,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { setCookie, getCookie, deleteCookie } from "cookies-next";
import { v4 as uuidv4 } from "uuid";

import { CartDataProps } from "@/types/interfaces/CartDataProps";
import paymentOptions from "@/utils/paymentOptions";
import useAuth from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/useIsMobile";

const PaymentInfo = dynamic(() => import("@/components/PaymentInfoModal"), {
  loading: () => <Spin />,
});
const ImageLightBox = dynamic(() => import("@/components/image/ImageLightBox"));

interface CardDataProps {
  eventId: number;
  watermarkedUrl: string;
  id: string;
  price: number;
}

const checkout = () => {
  const isLogin = useAuth();
  const isMobile = useIsMobile();
  const { data: session }: any = useSession();

  const orderId = "ord-" + uuidv4().substring(0, 12);

  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const router = useRouter();

  const [checkoutData, setCheckoutData] = useState([] as any);
  const [paymentValue, setPaymentValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currImg, setCurrImg] = useState(0); // [0, images.length - 1
  const [modal, contextHolder] = Modal.useModal();

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
      width: 80,
      render: (url: string, record) => (
        <img
          className="w-20 cursor-pointer"
          src={url}
          alt={record.id}
          onClick={() => handleClickImg(record.id)}
        />
      ),
    },
    {
      title: "價格",
      dataIndex: "price",
      key: "price",
      width: 100,
      render: (price: number) => <p>TWD {price} 元</p>,
    },
  ];

  useEffect(() => {
    const checkoutData = JSON.parse(getCookie("checkoutData") || "[]");
    setCheckoutData(checkoutData);
    setLoading(false);
  }, []);

  const fee =
    paymentOptions.find((option) => option.value === paymentValue)?.fee || 0;

  const total = checkoutData
    ?.map((item: CartDataProps) => Number(item.price))
    .reduce((a: string, b: string) => a + b, 0);

  const onChange = (e: RadioChangeEvent) => {
    setPaymentValue(e.target.value);
  };

  const removeFromCookieData = async () => {
    const currentCart = JSON.parse(getCookie("cart") || "{}");
    setCookie(
      "cart",
      JSON.stringify({
        ...currentCart,
        [checkoutData[0]?.eventId]: Object.values(currentCart)
          .flat()
          .filter(
            (item: any) =>
              !checkoutData.map((item: any) => item.id).includes(item)
          ),
      }),
      {
        expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      }
    );
    deleteCookie("checkoutData");
  };

  const createOrder = async () => {
    setLoading(true);
    //成立訂單
    if (session)
      fetch(`${domain}/api/orders/add`, {
        method: "POST",
        body: JSON.stringify({
          orderId,
          paymentMethod: paymentValue,
          totalAmount: total + fee,
          items: checkoutData,
          orderBy: session.id,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then(async (res) => {
          if (res.status === 200) {
            message.success("訂單建立成功");
            await removeFromCookieData();
            await gotoPayment();
            // router.push("/user/orders");
            // setLoading(false);
          }
        })
        .catch((err) => {
          console.log("err", err);
          message.error("訂單建立失敗, 請稍後再試");
        });
  };

  const showModal = () => {
    modal.confirm({
      title: "確認結帳",
      icon: <></>,
      content: (
        <div className="text-[color:var(--main-color-dark)]">
          <div className=" text-[color:var(--main-color-light)]">
            訂購內容：電子檔共 {checkoutData.length} 張
          </div>
          <div>
            付款方式：
            {
              paymentOptions.find((option) => option.value === paymentValue)
                ?.label
            }
          </div>
          <b>總金額：TWD {total + fee} 元</b>
        </div>
      ),
      okText: "確認",
      cancelText: "取消",
      onOk: () => {
        createOrder();
      },
    });
  };

  const gotoPayment = async () => {
    switch (paymentValue) {
      case 0:
        // 轉帳
        break;
      case 1:
        // 信用卡
        const res = await fetch(`${domain}/api/orders/checkout`, {
          method: "POST",
          body: JSON.stringify({
            orderId,
            paymentMethod: paymentValue,
            totalAmount: total + fee,
            items: checkoutData,
            orderBy: session.id,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (data.status === "success") {
          window.location.href = data.url;
        } else {
          message.error("訂單建立失敗, 請稍後再試");
        }
        break;
      case 2:
        const linePayRes = await fetch(`${domain}/api/linepay/request`, {
          method: "POST",
          body: JSON.stringify({
            orderId,
            totalAmount: total + fee,
            items: checkoutData,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data2 = await linePayRes.json();
        if (data2.status === "success") {
          try {
            const redirectUrl = isMobile
              ? data2.result?.app
              : data2.result?.web;

            router.push(redirectUrl);
          } catch (err) {
            message.error("LinePay扣款失敗, 請稍後再試");
          }
        } else {
          message.error("LinePay扣款失敗, 請稍後再試");
        }
        break;
      case 3:
        // 藍新金流
        const newebpayRes = await fetch(`${domain}/api/newebpay/request`, {
          method: "POST",
          body: JSON.stringify({
            orderId,
            totalAmount: total + fee,
            items: checkoutData,
            Email: session?.user.email,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        const newebpayData = await newebpayRes.json();

        if (newebpayData.status === "success") {
          try {
            //藍新金流要用form submit
            const form = document.createElement("form");
            form.action = newebpayData.url;
            form.method = "POST";

            Object.keys(newebpayData.result).forEach((key) => {
              const input = document.createElement("input");
              input.type = "hidden";
              input.name = key;
              input.value = newebpayData.result[key];
              form.appendChild(input);
            });

            document.body.appendChild(form);
            form.submit();
          } catch (err) {
            message.error("藍新金流扣款失敗, 請稍後再試");
          }
        } else {
          message.error("藍新金流扣款失敗, 請稍後再試");
        }
        break;
    }
  };

  const handleClickImg = (id: string) => {
    setShowImageViewer(true);
    setCurrImg(checkoutData.findIndex((item: any) => item.id === id));
  };

  const gotoPrevious = () => {
    setCurrImg(currImg - 1);
  };
  const gotoNext = () => {
    currImg + 1 < checkoutData.length && setCurrImg(currImg + 1);
  };

  return isLogin ? (
    <>
      <div className="container sm:px-4 px-0 mx-auto my-24 text-[color:var(--main-color-dark)] sm:w-[70%] w-[90%]">
        <h1 className="text-center text-2xl mb-10">訂單明細</h1>
        <h3 className="text-end my-4 text-sm">
          訂單狀態： <Tag color="gold">尚未建立</Tag>
        </h3>
        {!loading ? (
          <>
            <div>
              <Table
                pagination={false}
                dataSource={checkoutData}
                columns={columns}
                footer={() => (
                  <div className="flex justify-center">
                    <div className=" text-[color:var(--main-color-dark)]">
                      <div className=" text-[color:var(--main-color-light)]">
                        訂購內容：電子檔共 {checkoutData.length} 張
                      </div>
                      <div>
                        付款方式：
                        {
                          paymentOptions.find(
                            (option) => option.value === paymentValue
                          )?.label
                        }
                      </div>
                      <b>總金額：TWD {total + fee} 元</b>
                    </div>
                  </div>
                )}
              />
              <Divider />

              <div className="flex justify-center">
                <Radio.Group onChange={onChange} value={paymentValue}>
                  <Space direction="vertical">
                    {paymentOptions.map((option: any) => (
                      <Radio value={option.value} disabled={option.disabled}>
                        {option.label}
                        {option?.extension && paymentValue === option.value
                          ? option?.extension
                          : null}
                      </Radio>
                    ))}
                  </Space>
                </Radio.Group>
              </div>
            </div>

            <div className="flex justify-center my-8">
              <Button
                onClick={showModal}
                className="text-[color:var(--main-color-dark)]"
              >
                確認結帳
              </Button>
            </div>
            {/* <PaymentInfo
              handleOk={handleOk}
              handleCancel={handleCancel}
              isModalOpen={isModalOpen}
              orderId={orderId}
              confirmBtnText="建立訂單"
            />} */}
            <ImageLightBox
              images={checkoutData}
              isOpen={showImageViewer}
              curIndex={currImg}
              onClose={() => setShowImageViewer(false)}
              onPrev={gotoPrevious}
              onNext={gotoNext}
            />
          </>
        ) : (
          <Spin className="mx-auto my-[40vh] w-full" size="large" />
        )}
      </div>
    </>
  ) : (
    <Spin className="mx-auto my-[40vh] w-full" size="large" />
  );
};
export default checkout;
