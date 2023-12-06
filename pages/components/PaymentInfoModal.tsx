import { Modal } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";

interface Props {
  handleOk: () => void;
  handleCancel: () => void;
  isModalOpen: boolean;
}

const PaymentInfo: React.FC<Props> = ({
  handleOk,
  handleCancel,
  isModalOpen,
}) => {
  return (
    <>
      <Modal
        title={
          <>
            <InfoCircleOutlined />
            {" 付款資訊"}
          </>
        }
        open={isModalOpen}
        onOk={handleOk}
        okText="確認"
        cancelText="取消"
        mask={true}
        onCancel={handleCancel}
        className="text-[color:var(--main-color-dark)]"
      >
        <div className="flex justify-evenly items-center">
          <div>
            <p>請轉帳至：台新銀行(812)</p>
            <p>收款帳號：0020891050050438</p>
            <div className="flex gap-1">
              <p>完成付款後請加入官方Line</p>
              <p>私訊告知帳號後五碼</p>
            </div>
          </div>
          <div className="w-20 cursor-pointer">
            <a
              href="https://lin.ee/n4xOm2O"
              target="_blank"
              className="text-center"
            >
              <img src="/line.png" alt="加入好友" />
              <p className="text-[10px] text-[#09b239]">加入好友</p>
            </a>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PaymentInfo;
