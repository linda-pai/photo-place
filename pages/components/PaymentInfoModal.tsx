import React, { useState } from "react";
import { Modal, Input, Popover } from "antd";
import { InfoCircleOutlined, CopyOutlined } from "@ant-design/icons";
import copyToClipboard from "@/utils/copyToClipboard";

interface Props {
  handleOk: () => void;
  handleCancel: () => void;
  isModalOpen: boolean;
  orderId: any;
  confirmBtnText: string;
}

const PaymentInfo: React.FC<Props> = ({
  handleOk,
  handleCancel,
  isModalOpen,
  orderId,
  confirmBtnText,
}) => {
  const [templateText, setTemplateText] = useState("");
  const content = (
    <div className=" hover:text-slate-700 mx-auto leading-6 bg-[color:var(--main-color-lighter)] rounded-lg w-fit p-4">
      <button
        className="flex items-center"
        onClick={() =>
          copyToClipboard(
            `Photo Pacer 攝影小隊你好 \n訂單編號：${orderId} \n帳號後五碼：${templateText} \n已完成付款，謝謝！`
          )
        }
      >
        <CopyOutlined className="mr-1 text-slate-500" />
        <p className="text-slate-500">點擊即可複製</p>
      </button>
      <p>Photo Pacer 攝影小隊你好</p>
      <p>訂單編號：{orderId}</p>
      <div className="flex items-center">
        <p>帳號後五碼：</p>
        <Input
          className="w-28 h-6"
          placeholder="請填寫付款帳號"
          maxLength={5}
          onChange={(e) => setTemplateText(e.target.value)}
        />
      </div>
      <p>已完成付款，謝謝！</p>
    </div>
  );
  return (
    <>
      <Modal
        title={
          <>
            訂單編號：
            <button
              className="text-slate-500 hover:text-slate-700"
              onClick={() => copyToClipboard(orderId)}
            >
              {orderId}
            </button>
          </>
        }
        open={isModalOpen}
        onOk={handleOk}
        okText={confirmBtnText}
        cancelText="取消"
        mask={true}
        onCancel={handleCancel}
        className="text-[color:var(--main-color-dark)]"
      >
        <div className="flex justify-between items-center">
          <div>
            <p>請轉帳至：台新銀行(812)</p>
            <div className="flex">
              <p>收款帳號：</p>
              <button
                className="text-slate-500 hover:text-slate-700"
                onClick={() => copyToClipboard("0020891050050438")}
              >
                <CopyOutlined className="mr-1" />
                0020891050050438
              </button>
            </div>
            <div className="font-bold text-orange-500">
              <p>完成付款後，請加入官方Line </p>
              <Popover content={content} className="cursor-pointer">
                <div className="flex">
                  <InfoCircleOutlined />
                  <p>私訊告知 </p>
                  <p className="underline">訂單編號</p>及
                  <p className="underline">付款帳號後五碼</p>
                </div>
              </Popover>
            </div>
          </div>
          <div className="w-20 cursor-pointer">
            <a
              href="https://lin.ee/n4xOm2O"
              target="_blank"
              className="text-center"
            >
              <img src="/line.png" alt="點擊加入好友" />
              <p className="text-[10px] text-[#09b239]">點擊加入好友</p>
            </a>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PaymentInfo;
