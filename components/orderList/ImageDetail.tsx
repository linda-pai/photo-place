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
        onClick={() => items && handleOnToggle(index)}
        className="flex gap-8 items-center hover:cursor-pointer"
      >
        <p className="text-end">共 {items ? items?.length : 0} 張</p>
        {items && (
          <p className="text-blue-500">{toggle[index] ? "收合" : "展開"}</p>
        )}
      </div>

      {toggle[index] && (
        <Collapse
          items={items.map((item: any, key: number) => ({
            key: item.id,
            label: item.id,
            children: (
              <>
                <p>TWD {item.price} 元</p>
                <img
                  onClick={() => handleImageClick(key)}
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
