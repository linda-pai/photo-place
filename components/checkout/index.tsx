import React, { useState, useEffect } from "react";
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
import { useIsMobile } from "@/hooks/useIsMobile";
import handleNewebPay from "@/lib/payment/handleNewebPay";
import handleLinePay from "@/lib/payment/handleLinePay";

const ImageLightBox = dynamic(() => import("@/components/image/ImageLightBox"));

const Checkout = () => {
  const isMobile = useIsMobile();
  const { data: session }: any = useSession();

  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [checkoutData, setCheckoutData] = useState([] as any);
  const [paymentValue, setPaymentValue] = useState(0);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currImg, setCurrImg] = useState(0); // [0, images.length - 1
  const [modal, contextHolder] = Modal.useModal();

  const columns: ColumnsType<CartDataProps> = [
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

  const handleClickImg = (id: string) => {
    setShowImageViewer(true);
    setCurrImg(checkoutData.findIndex((item: any) => item.id === id));
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

  const gotoPayment = async (orderId: string) => {
    switch (paymentValue) {
      case 2:
        //  LinePay
        const LineData = {
          orderId,
          totalAmount: total + fee,
          items: checkoutData,
          isMobile,
        };
        const LineRes = await handleLinePay(LineData);
        if (LineRes.status === "success") {
          try {
            if (isMobile) {
              router.push(LineRes.result?.app);
              // 手機版付款完成後回不來，所以1秒後導向訂單頁面
              setTimeout(() => {
                router.push("/user/orders");
              }, 1000);
            } else {
              router.push(LineRes.result?.web);
            }
          } catch (err) {
            message.error("LinePay扣款失敗, 請稍後再試");
          }
        } else {
          message.error("LinePay扣款失敗, 請稍後再試");
        }
        break;
      case 3:
        // 藍新金流
        const orderData = {
          orderId,
          totalAmount: total + fee,
          items: checkoutData,
          email: session?.user.email,
        };
        try {
          await handleNewebPay(orderData);
        } catch (err) {
          message.error("藍新金流扣款失敗, 請稍後再試");
        }
        break;
    }
  };

  const createOrder = async () => {
    const orderId = "ord-" + uuidv4().substring(0, 12);

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
            await gotoPayment(orderId);
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

  const gotoPrevious = () => {
    setCurrImg(currImg - 1);
  };
  const gotoNext = () => {
    currImg + 1 < checkoutData.length && setCurrImg(currImg + 1);
  };

  return (
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
              <div className="">
                <div className="my-8">
                  <h3 className="text-xl">付款方式</h3>
                  <p className="text-sm">
                    請選擇您的付款方式，點擊確認結帳後，將會導向付款頁面
                  </p>
                </div>

                <Radio.Group onChange={onChange} value={paymentValue}>
                  <Space direction="vertical">
                    {paymentOptions.map((option: any, key: number) => (
                      <Radio
                        value={option.value}
                        disabled={checkoutData.length === 0 || option.disabled}
                        key={key}
                      >
                        <div className="flex items-center gap-2 text-[color:var(--main-color-dark)]">
                          <img
                            width={80}
                            height={80}
                            src={option.icon}
                            alt={option.label}
                          />
                          <p className="font-medium">{option.label}</p>
                          <p className="">{option?.desc}</p>
                        </div>
                      </Radio>
                    ))}
                  </Space>
                </Radio.Group>
              </div>
            </div>
          </div>

          <div className="flex justify-center my-8">
            <Button
              onClick={showModal}
              className="text-[color:var(--main-color-dark)]"
              disabled={paymentValue === 0}
            >
              確認結帳
            </Button>
          </div>
          {contextHolder}
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
  );
};

export default Checkout;
