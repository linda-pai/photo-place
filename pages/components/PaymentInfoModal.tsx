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
        <p>請轉帳至：台新銀行(812)</p>
        <p>收款帳號：0020891050050438</p>
        <p>完成付款後請加入官方Line 私訊告知帳號後五碼</p>
      </Modal>
    </>
  );
};

export default PaymentInfo;
