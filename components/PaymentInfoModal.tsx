import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Modal, Radio, Space, RadioChangeEvent, message } from "antd";
import paymentOptions from "@/utils/paymentOptions";
import handleNewebPay from "@/lib/payment/handleNewebPay";
import handleLinePay from "@/lib/payment/handleLinePay";
import { useIsMobile } from "@/hooks/useIsMobile";

interface Props {
  handleCancel: () => void;
  isModalOpen: boolean;
  confirmBtnText: string;
  paymentMethod: number;
  currentOrder: any;
  modelDescription: string;
}

const PaymentInfo: React.FC<Props> = ({
  handleCancel,
  isModalOpen,
  confirmBtnText,
  paymentMethod,
  currentOrder,
  modelDescription,
}) => {
  const isMobile = useIsMobile();
  const { data: session }: any = useSession();

  const router = useRouter();

  const [paymentValue, setPaymentValue] = useState(paymentMethod);

  useEffect(() => {
    setPaymentValue(paymentMethod);
  }, [paymentMethod]);

  const onChange = (e: RadioChangeEvent) => {
    setPaymentValue(e.target.value);
  };

  const handleOk = async () => {
    const { orderId, totalAmount, items } = currentOrder;
    switch (paymentValue) {
      case 2:
        //  LinePay
        const LineData = {
          orderId,
          totalAmount,
          items,
          isMobile,
          orderBy: session.id,
        };
        const LineRes = await handleLinePay(LineData);
        if (LineRes.status === "success") {
          try {
            if (isMobile) {
              router.push(LineRes.result?.app);
              setTimeout(() => {
                router.push("/user/orders");
              }, 1000);
            } else {
              router.push(LineRes.result?.web);
            }
          } catch (err) {
            message.error("LinePay扣款失敗, 請稍後再試");
          }
        } else if (LineRes.status === "paid") {
          message.success("訂單已付款");
        } else {
          message.error("LinePay扣款失敗, 請稍後再試");
        }
        break;
      case 3:
        // 藍新金流
        const orderData = {
          orderId,
          totalAmount,
          items,
          email: session.user.email,
          orderBy: session.id,
        };
        try {
          const newebPayRes = await handleNewebPay(orderData);
          if (newebPayRes?.status === "paid") {
            message.success("訂單已付款");
          } else if (newebPayRes?.status === "fail") {
            message.error("藍新金流扣款失敗, 請稍後再試");
          }
        } catch (err) {
          message.error("藍新金流扣款失敗, 請稍後再試");
        }
        break;
    }
  };
  return (
    <>
      <Modal
        title="訂單尚未付款"
        open={isModalOpen}
        onOk={handleOk}
        okText={confirmBtnText}
        cancelText="取消"
        mask={true}
        onCancel={handleCancel}
        className="text-[color:var(--main-color-dark)]"
      >
        <div className="">
          <div></div>
          <div>{modelDescription}</div>
          <div className="flex my-4">
            <Radio.Group onChange={onChange} value={paymentValue}>
              <Space>
                {paymentOptions.map((option: any, key: number) => (
                  <Radio
                    value={option.value}
                    disabled={option.disabled}
                    key={key}
                  >
                    <div className="flex items-center gap-2 text-[color:var(--main-color-dark)] font-medium">
                      <Image
                        width={50}
                        height={50}
                        src={option.icon}
                        alt={option.label}
                      />
                      {option.label}
                    </div>
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </div>
        </div>
        {/* <div className="flex justify-between items-center">
          <div className="w-20 cursor-pointer">
            <a
              href="https://lin.ee/n4xOm2O"
              target="_blank"
              className="text-center"
              title="點擊加入好友"
            >
              <img src="/line.png" alt="點擊加入好友" />
              <p className="text-[10px] text-[#09b239]">點擊加入好友</p>
            </a>
          </div>
        </div> */}
      </Modal>
    </>
  );
};

export default PaymentInfo;
