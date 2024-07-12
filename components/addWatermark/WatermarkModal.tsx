import { useState, useEffect } from "react";
import { Modal, message, Button, Badge } from "antd";
import { BgColorsOutlined } from "@ant-design/icons";
import WatermarkSteps from "./WatermarkSteps";

const WatermarkModal = ({
  eventId,
  toBeWatermarked,
  handleRemoveWatermarkedImg,
}: {
  eventId: string;
  toBeWatermarked: any[];
  handleRemoveWatermarkedImg: (item: any) => void;
}) => {
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (toBeWatermarked?.length === 0) setModalOpen(false);
  }, [toBeWatermarked]);

  return (
    <div className="flex justify-end mb-4 mr-4 gap-1">
      <Badge count={toBeWatermarked?.length || 0}>
        <Button
          onClick={() => {
            if (!toBeWatermarked || toBeWatermarked?.length === 0) {
              message.error("請選擇要添加浮水印的照片");
              return;
            }
            setModalOpen((prev) => !prev);
          }}
          className="flex items-center bg-[#f97316] text-white border-[#f97316]"
        >
          <BgColorsOutlined />
          添加浮水印
        </Button>
      </Badge>

      <Modal
        title="添加浮水印"
        footer={null}
        open={isModalOpen}
        onCancel={() => setModalOpen(false)}
      >
        <WatermarkSteps
          toBeWatermarked={toBeWatermarked}
          handleRemoveWatermarkedImg={handleRemoveWatermarkedImg}
          eventId={eventId}
        />
      </Modal>
    </div>
  );
};

export default WatermarkModal;
