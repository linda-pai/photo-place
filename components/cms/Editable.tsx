import React, { useState } from "react";
import { EditOutlined } from "@ant-design/icons";
import { Input } from "antd";

const Editable = ({
  item,
  targetId,
  text,
  updateFunction,
  handleRemarkChange,
}: {
  item: any;
  targetId: string;
  text: string;
  updateFunction: any;
  handleRemarkChange: any;
}) => {
  const [editing, setEditing] = useState<{ [key: string]: boolean }>({});
  const handleInputConfirm = (targetId: string, text: string) => {
    setEditing((prev: any) => ({ ...prev, [targetId]: false }));

    updateFunction(targetId, text);
  };

  const toggle = (targetId: string) => {
    setEditing((prevToggle: any) => ({
      ...prevToggle,
      [targetId]: !prevToggle[targetId],
    }));
  };

  return (
    <div>
      {/* 可編輯 */}
      <EditOutlined onClick={() => toggle(targetId)} />
      {editing[targetId] ? (
        <Input
          value={text}
          onChange={(e) => handleRemarkChange(e, item)}
          onPressEnter={() => handleInputConfirm(targetId, text)}
        />
      ) : (
        <p>{text}</p>
      )}
    </div>
  );
};

export default Editable;
