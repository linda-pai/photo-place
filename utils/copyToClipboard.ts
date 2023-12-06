import { message } from "antd";

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  message.success("已複製");
};

export default copyToClipboard;
