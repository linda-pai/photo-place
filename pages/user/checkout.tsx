import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Divider,
  List,
  Space,
  Radio,
  Input,
  RadioChangeEvent,
  Button,
  message,
  Spin,
} from "antd";
import { MessageOutlined, LikeOutlined, StarOutlined } from "@ant-design/icons";
import { getCookie } from "cookies-next";
import { CartDataProps } from "@/types/interfaces/CartDataProps";
import PaymentInfo from "@/pages/components/PaymentInfoModal";

const checkout = () => {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const router = useRouter();

  const [checkoutData, setCheckoutData] = useState([]);
  const [paymentValue, setPaymentValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const paymentOptions = [
    {
      label: "銀行轉帳",
      value: 0,
      fee: 0,
      extension: <Input style={{ width: 100, marginLeft: 10 }} />,
    },
    { label: "信用卡", value: 1, fee: 0, disabled: true },
    { label: "Line Pay", value: 2, fee: 30, disabled: true },
  ];

  useEffect(() => {
    const checkoutData = JSON.parse(
      sessionStorage.getItem("checkoutData") || "{}"
    );
    setCheckoutData(checkoutData);
    setLoading(false);
  }, []);

  const IconText = ({ icon, text }: { icon: React.FC; text: string }) => (
    <Space>
      {React.createElement(icon)}
      {text}
    </Space>
  );

  const fee =
    paymentOptions.find((option) => option.value === paymentValue)?.fee || 0;

  const total = checkoutData
    .map((item: CartDataProps) => Number(item.price))
    .reduce((a, b) => a + b, 0);

  const onChange = (e: RadioChangeEvent) => {
    console.log("radio checked", e.target.value);
    setPaymentValue(e.target.value);
  };

  const createOrder = async () => {
    setLoading(true);
    //成立訂單
    fetch(`${domain}/api/orders/add`, {
      method: "POST",
      body: JSON.stringify({
        paymentMethod: paymentValue,
        totalAmount: total + fee,
        items: checkoutData,
        orderBy: getCookie("userId"),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        console.log("res", res);
        if (res.status === 200) {
          sessionStorage.removeItem("checkoutData");
          sessionStorage.removeItem("cart");
          setCheckoutData([]);
          message.success("訂單建立成功");
          router.push("/user/orders");
          setLoading(false);
        }
      })
      .catch((err) => {
        console.log("err", err);
      });
  };

  // const handleOnCheckOut = () => {
  //   setIsModalOpen(true);
  // };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
    createOrder();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="container mx-auto my-10">
        <h1 className="text-center text-2xl mb-20">checkout</h1>
        {!loading ? (
          <>
            <div>
              <List
                header={<div className="text-center">訂單明細</div>}
                footer={
                  <div className="text-end">
                    <div>
                      付款方式：
                      {
                        paymentOptions.find(
                          (option) => option.value === paymentValue
                        )?.label
                      }
                    </div>
                    <p>總金額：TWD {total + fee} 元</p>
                  </div>
                }
                itemLayout="vertical"
                bordered
                dataSource={checkoutData}
                renderItem={(item: CartDataProps) => (
                  <List.Item
                    key={item.id}
                    actions={[
                      <IconText
                        icon={StarOutlined}
                        text="156"
                        key="list-vertical-star-o"
                      />,
                      <IconText
                        icon={LikeOutlined}
                        text="156"
                        key="list-vertical-like-o"
                      />,
                      <IconText
                        icon={MessageOutlined}
                        text="2"
                        key="list-vertical-message"
                      />,
                    ]}
                    extra={<p>TWD {item.price} 元</p>}
                  >
                    <img width={272} alt="logo" src={item.watermarkedUrl} />
                  </List.Item>
                )}
              />
              <Divider />

              <Radio.Group onChange={onChange} value={paymentValue}>
                <Space direction="vertical">
                  {paymentOptions.map((option) => (
                    <Radio value={option.value} disabled={option.disabled}>
                      {option.label}
                      {option.extension && paymentValue === option.value
                        ? option.extension
                        : null}
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            </div>
            <Button className="text-center" onClick={showModal}>
              結帳
            </Button>
            <PaymentInfo
              handleOk={handleOk}
              handleCancel={handleCancel}
              isModalOpen={isModalOpen}
            />
          </>
        ) : (
          <Spin className="mx-auto my-[40vh] w-full" size="large" />
        )}
      </div>
    </>
  );
};
export default checkout;

export const getServerSideProps = async (context: any) => {
  const previousUrl = context.req.headers.referer || context.req.url;
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
