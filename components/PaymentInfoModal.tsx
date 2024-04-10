import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Modal, Radio, Space, RadioChangeEvent } from "antd";
import paymentOptions from "@/utils/paymentOptions";
import handlePayment from "@/lib/payment/handlePayment";
import { useIsMobile } from "@/hooks/useIsMobile";

interface Props {
  handleCancel: () => void;
  isModalOpen: boolean;
  confirmBtnText: string;
  currentOrder: any;
  modelDescription: string;
}

const PaymentInfo: React.FC<Props> = ({
  handleCancel,
  isModalOpen,
  confirmBtnText,
  currentOrder,
  modelDescription,
}) => {
  const { paymentMethod } = currentOrder;

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

    await handlePayment({
      paymentValue,
      orderId,
      totalAmount,
      items,
      isMobile,
      session,
      router,
    });
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
