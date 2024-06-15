import { useState } from "react";
import { Statistic, Modal, Table, Radio, Tag } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { RecordOfUploadProps } from "@/types/interfaces/UploadProps";
import { CHARGE_TYPE } from "@/constants";

const Earnings = ({ record }: { record: RecordOfUploadProps }) => {
  const [chargeType, setChargeType] = useState(CHARGE_TYPE.PAY_AS_YOU_GO);
  const [isModalOpen, setModalOpen] = useState<{
    [key: string]: boolean;
  }>({});

  const allImageLength = record?.allImageLength || 0;
  const payAsYouGofee = (allImageLength * 0.2).toFixed(2);
  const detectFee = (allImageLength * 0.1).toFixed(2);

  const flattenSoldImages = record.soldImages?.reduce((acc: any, cur: any) => {
    return acc.concat(cur.images);
  }, []);

  const revenue = flattenSoldImages
    ?.map((item: any) => item.price || 0)
    .reduce((acc: any, cur: any) => acc + cur, 0);

  const thirdPartyFee = flattenSoldImages
    ?.map((item: any) => {
      return Math.round((item.price || 0) * 0.03);
    })
    .reduce((acc: any, cur: any) => acc + cur, 0);

  const shareFee = Math.round(
    flattenSoldImages
      ?.map((item: any) => {
        return (item.price || 0) * 0.35;
      })
      .reduce((acc: any, cur: any) => acc + cur, 0)
  );

  const payAsYouGoColumns = [
    {
      title: () => {
        return (
          <div>
            <p>照片收益</p>
            <p className="font-normal text-[#a3a3a3] text-xs">
              賣出 {flattenSoldImages?.length || 0} 張
            </p>
          </div>
        );
      },
      dataIndex: "revenue",
      key: "revenue",
      width: 90,
      render: () => (
        <div>
          <p>{revenue || 0} 元</p>
        </div>
      ),
    },
    {
      title: () => {
        return (
          <div>
            <p>上傳用量費</p>
            <p className="font-normal text-[#a3a3a3] text-xs">
              {allImageLength}張 x 每張 0.2 元
            </p>
          </div>
        );
      },
      dataIndex: "fee",
      key: "fee",
      render: () => <div>{payAsYouGofee} 元</div>,
    },
    {
      title: () => {
        return (
          <div>
            <p>第三方金流手續費</p>
            <p className="font-normal text-[#a3a3a3] text-xs">
              賣出 {revenue || 0} 元 x 3%
            </p>
          </div>
        );
      },
      dataIndex: "thirdPartyFee",
      key: "thirdPartyFee",
      render: () => <div>{thirdPartyFee || 0} 元</div>,
    },
  ];

  const reveneuShareColumns = [
    {
      title: () => {
        return (
          <div>
            <p>照片收益</p>
            <p className="font-normal text-[#a3a3a3] text-xs">
              賣出 {flattenSoldImages?.length || 0} 張
            </p>
          </div>
        );
      },
      dataIndex: "revenue",
      key: "revenue",
      width: 90,
      render: () => (
        <div>
          <p>{revenue || 0} 元</p>
        </div>
      ),
    },
    {
      title: () => {
        return (
          <div>
            <p>號碼布辨識費</p>
            <p className="font-normal text-[#a3a3a3] text-xs">
              {allImageLength}張 x 每張 0.1 元
            </p>
          </div>
        );
      },
      dataIndex: "fee",
      key: "fee",
      render: () => <div>{detectFee} 元</div>,
    },
    {
      title: () => {
        return (
          <div>
            <p>售出抽成</p>
            <p className="font-normal text-[#a3a3a3] text-xs">
              賣出 {revenue || 0} 元 x 35%
            </p>
          </div>
        );
      },
      dataIndex: "thirdPartyFee",
      key: "thirdPartyFee",
      render: () => <div>{shareFee || 0} 元</div>,
    },
  ];

  const payAsYouGoReveneu =
    Math.round(revenue - Number(payAsYouGofee) - thirdPartyFee) || 0;

  const reveneuShareReveneu =
    Math.round(revenue - Number(detectFee) - shareFee) || 0;

  // 取高者
  const finalReveneu =
    payAsYouGoReveneu >= reveneuShareReveneu
      ? payAsYouGoReveneu
      : reveneuShareReveneu;

  return (
    <>
      <div
        className="flex gap-2 hover:cursor-pointer"
        onClick={() =>
          setModalOpen((prev) => ({
            ...prev,
            [record.eventId]: true,
          }))
        }
      >
        <Statistic
          title="收入"
          value={
            // 取高者
            finalReveneu > 0 ? finalReveneu : 0
          }
          valueStyle={{ color: "#ef4444" }}
        />
        <InfoCircleOutlined className="text-[#06b6d4]" />
      </div>
      <Modal
        title={`收入明細 - ${record.eventName}`}
        onCancel={() =>
          setModalOpen((prev) => ({
            ...prev,
            [record.eventId]: false,
          }))
        }
        cancelButtonProps={{ style: { display: "none" } }}
        footer={null}
        onOk={() =>
          setModalOpen((prev) => ({
            ...prev,
            [record.eventId]: false,
          }))
        }
        open={isModalOpen[record.eventId]}
        className="w-[20%] mx-auto"
      >
        <div className="sm:flex items-end justify-between">
          <Radio.Group
            defaultValue={chargeType}
            buttonStyle="solid"
            className="mt-2"
            onChange={(e) => setChargeType(e.target.value)}
          >
            <Radio.Button value={CHARGE_TYPE.PAY_AS_YOU_GO}>
              使用量制
            </Radio.Button>
            <Radio.Button value={CHARGE_TYPE.REVENEUE_SHARING}>
              售出抽成制
            </Radio.Button>
          </Radio.Group>
          <p className="text-orange-600  mx-2">＊於結帳日則優計算</p>
        </div>
        <Table
          columns={
            chargeType === CHARGE_TYPE.PAY_AS_YOU_GO
              ? payAsYouGoColumns
              : reveneuShareColumns
          }
          dataSource={[record]}
          pagination={false}
          className="my-2"
          footer={() => (
            <div className="text-end">
              <h6>
                <Tag color="green">
                  總收益:{" "}
                  {chargeType === CHARGE_TYPE.PAY_AS_YOU_GO
                    ? payAsYouGoReveneu
                    : reveneuShareReveneu}{" "}
                  元
                </Tag>
              </h6>
            </div>
          )}
        />
      </Modal>
    </>
  );
};

export default Earnings;
