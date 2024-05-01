import { Radio, Space } from "antd";
import paymentOptions from "@/utils/paymentOptions";

const PaymentOption = ({
  paymentValue,
  onChange,
  disabled,
}: {
  paymentValue: number;
  onChange: (e: any) => void;
  disabled: boolean;
}) => {
  return (
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
                disabled={disabled || option.disabled}
                key={key}
              >
                <div className="flex items-center gap-2 text-[color:var(--main-color-dark)]">
                  <img
                    width={80}
                    height={80}
                    src={option.icon}
                    alt={option.label}
                  />
                  <div className="flex">
                    <p className="font-medium hidden sm:block">
                      {option.label}
                    </p>
                    <p className="">{option?.desc}</p>
                  </div>
                </div>
              </Radio>
            ))}
          </Space>
        </Radio.Group>
      </div>
    </div>
  );
};
export default PaymentOption;
