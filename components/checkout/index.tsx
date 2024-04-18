import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Divider,
  RadioChangeEvent,
  Button,
  Spin,
  Table,
  Tag,
  Modal,
} from "antd";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { getCookie } from "cookies-next";
import { v4 as uuidv4 } from "uuid";
import { CartDataProps } from "@/types/interfaces/CartDataProps";
import paymentOptions from "@/utils/paymentOptions";
import { useIsMobile } from "@/hooks/useIsMobile";
import handlePayment from "@/lib/payment/handlePayment";
import tableConfig from "./tableConfig";

const ImageLightBox = dynamic(() => import("@/components/image/ImageLightBox"));
const PaymentOption = dynamic(
  () => import("@/components/checkout/PaymentOption"),
  {
    loading: () => <Spin />,
  }
);

const Checkout = () => {
  const isMobile = useIsMobile();
  const { data: session }: any = useSession();

  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [checkoutData, setCheckoutData] = useState([] as any);
  const [paymentValue, setPaymentValue] = useState(0);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currImg, setCurrImg] = useState(0); // [0, images.length - 1
  const [modal, contextHolder] = Modal.useModal();

  const columnsRenderMap = {
    watermarkedUrl: {
      render: (url: string, record: CartDataProps) => (
        <img
          className="w-20 cursor-pointer"
          src={url}
          alt={record.id}
          onClick={() => handleClickImg(record.id)}
        />
      ),
    },
    price: {
      render: (price: number) => <p>TWD {price} 元</p>,
    },
  };

  const columns = tableConfig(columnsRenderMap);

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

  const gotoPayment = async () => {
    const orderId = "ord-" + uuidv4().substring(0, 12);

    await handlePayment({
      paymentValue,
      orderId,
      totalAmount: total + fee,
      items: checkoutData,
      isMobile,
      session,
      router,
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
        gotoPayment();
      },
    });
  };

  const gotoPrevious = () => {
    currImg > 0 && setCurrImg(currImg - 1);
  };
  const gotoNext = () => {
    currImg + 1 < checkoutData.length && setCurrImg(currImg + 1);
  };

  return (
    <div className="container sm:px-4 px-0 mx-auto my-10 text-[color:var(--main-color-dark)] sm:w-[70%] w-[90%]">
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
            <PaymentOption
              paymentValue={paymentValue}
              onChange={onChange}
              disabled={checkoutData.length === 0}
            />
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
            customFooter={null}
          />
        </>
      ) : (
        <Spin className="mx-auto my-[40vh] w-full" size="large" />
      )}
    </div>
  );
};

export default Checkout;
