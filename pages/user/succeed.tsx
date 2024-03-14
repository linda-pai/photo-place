import { useEffect } from "react";
import { useRouter } from "next/router";
import useAuth from "@/hooks/useAuth";

import { Modal } from "antd";

const Succeed = () => {
  const isLogin = useAuth();

  const [modal, contextHolder] = Modal.useModal();
  const router = useRouter();

  useEffect(() => {
    modal.success({
      title: "交易完成",
      content: "請至訂單查詢頁面查看訂單狀態",
      okText: "前往訂單查詢頁",
      onOk: () => router.push("/user/orders"),
    });
  }, [isLogin]);

  return isLogin ? (
    <div className="container sm:px-4 px-0 mx-auto my-24 text-[color:var(--main-color-dark)] sm:w-[70%] w-[90%]">
      {contextHolder}
    </div>
  ) : null;
};

export default Succeed;
