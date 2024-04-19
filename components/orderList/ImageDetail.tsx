import React, { useState } from "react";
import { Carousel, Image, Space } from "antd";
import { ZoomInOutlined, ZoomOutOutlined } from "@ant-design/icons";

const ImageDetail = ({ index, items }: any) => {
  const [toggle, setToggle] = useState<{ [key: number]: boolean }>({});

  const handleOnToggle = (index: number) => {
    setToggle((prevToggle) => ({ ...prevToggle, [index]: !prevToggle[index] }));
  };

  return (
    <div>
      <div
        onClick={() => items && handleOnToggle(index)}
        className="flex gap-8 items-center hover:cursor-pointer"
      >
        <p className="text-end">共 {items ? items?.length : 0} 張</p>
        {items && (
          <p className="text-blue-500">{toggle[index] ? "收合" : "展開"}</p>
        )}
      </div>

      {toggle[index] && (
        <Carousel className="my-2">
          {items.map((item: any, key: number) => (
            <div key={key}>
              <Image
                src={item.watermarkedUrl}
                alt={item.watermarkedUrl}
                preview={{
                  toolbarRender: (
                    _,
                    { transform: { scale }, actions: { onZoomOut, onZoomIn } }
                  ) => (
                    <Space size={60} className="toolbar-wrapper">
                      <ZoomOutOutlined
                        disabled={scale === 1}
                        onClick={onZoomOut}
                        className="scale-[2.5]"
                      />
                      <ZoomInOutlined
                        disabled={scale === 50}
                        className="scale-[2.5]"
                        onClick={onZoomIn}
                      />
                    </Space>
                  ),
                }}
              />
            </div>
          ))}
        </Carousel>
      )}
    </div>
  );
};

export default ImageDetail;
