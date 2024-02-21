import React, { useState } from "react";
import { Collapse } from "antd";

const ImageDetail = ({ index, items, handleImageClick }: any) => {
  const [toggle, setToggle] = useState<{ [key: number]: boolean }>({});

  const handleOnToggle = (index: number) => {
    setToggle((prevToggle) => ({ ...prevToggle, [index]: !prevToggle[index] }));
  };

  return (
    <div>
      <div
        onClick={() => handleOnToggle(index)}
        className="flex gap-8 items-center hover:cursor-pointer"
      >
        <p className="text-end">共 {items?.length} 張</p>
        <p className="text-blue-500">{toggle[index] ? "收合" : "展開"}</p>
      </div>

      {toggle[index] && (
        <Collapse
          items={items.map((item: any) => ({
            key: item.id,
            label: item.id,
            children: (
              <>
                <p>TWD {item.price} 元</p>
                <img
                  onClick={handleImageClick}
                  src={item.watermarkedUrl}
                  alt={item.watermarkedUrl}
                />
              </>
            ),
          }))}
          ghost
          className="truncate"
        />
      )}
    </div>
  );
};

export default ImageDetail;
