import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Modal, Radio, Space, RadioChangeEvent } from "antd";
import paymentOptions from "@/utils/paymentOptions";

interface Props {
  handleOk: (value: number) => void;
  handleCancel: () => void;
  isModalOpen: boolean;
  confirmBtnText: string;
  paymentMethod?: number;
}

const PaymentInfo: React.FC<Props> = ({
  handleOk,
  handleCancel,
  isModalOpen,
  confirmBtnText,
  paymentMethod,
}) => {
  const [paymentValue, setPaymentValue] = useState(paymentMethod);

  useEffect(() => {
    setPaymentValue(paymentMethod);
  }, [paymentMethod]);

  const onChange = (e: RadioChangeEvent) => {
    setPaymentValue(e.target.value);
  };
  return (
    <>
      <Modal
        title="訂單尚未付款"
        open={isModalOpen}
        onOk={() => paymentValue && handleOk(paymentValue)}
        okText={confirmBtnText}
        cancelText="取消"
        mask={true}
        onCancel={handleCancel}
        className="text-[color:var(--main-color-dark)]"
      >
        <div className="">
          <div></div>
          <div>付款完成後即可下載照片，是否要前往付款?</div>
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
