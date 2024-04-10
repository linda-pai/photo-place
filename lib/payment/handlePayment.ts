import { setCookie, getCookie, deleteCookie } from "cookies-next";
import { message } from "antd";
import handleLinePay from "./handleLinePay";
import handleNewebPay from "./handleNewebPay";
import { CartDataProps } from "@/types/interfaces/CartDataProps";

const handlePayment = async ({
  paymentValue,
  orderId,
  totalAmount,
  items,
  isMobile,
  session,
  router,
}: {
  paymentValue: number;
  orderId: string;
  totalAmount: number;
  items: CartDataProps[];
  isMobile?: boolean;
  session: any;
  router: any;
}) => {
  const removeFromCookieData = (items: CartDataProps[]) => {
    const currentCart = JSON.parse(getCookie("cart") || "{}");
    const newCartData = {
      ...currentCart,
      //TODO: 如果購買的照片是不同活動的，要分開處理
      [items[0]?.eventId]: Object.values(currentCart)
        .flat()
        .filter(
          (item: any) => !items.map((item: any) => item.id).includes(item)
        ),
    };
    setCookie("cart", JSON.stringify(newCartData), {
      expires: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    });
    deleteCookie("checkoutData");
  };

  switch (paymentValue) {
    case 2:
      //  LinePay
      const LineData = {
        orderId,
        totalAmount,
        items,
        isMobile,
        orderBy: session.id,
      } as any;
      try {
        const LineRes = await handleLinePay(LineData);
        if (LineRes.status === "success") {
          removeFromCookieData(items);
          if (isMobile) {
            router.push(LineRes.result?.app);
            // 手機版付款完成後回不來，所以1秒後導向成功頁
            setTimeout(() => {
              router.push("/user/orders");
            }, 1000);
          } else {
            router.push(LineRes.result?.web);
          }
        } else if (LineRes.status === "paid") {
          message.success("訂單已付款");
        } else {
          message.error("LinePay扣款失敗, 請稍後再試");
        }
      } catch (err) {
        message.error("LinePay扣款失敗, 請稍後再試");
      }

      break;
    case 3:
      // 藍新金流
      const orderData = {
        orderId,
        totalAmount,
        items,
        email: session.user.email,
        orderBy: session.id,
      };
      try {
        const newebPayRes = await handleNewebPay(orderData);
        if (newebPayRes?.status === "success") {
          removeFromCookieData(items);
        } else if (newebPayRes?.status === "paid") {
          message.success("訂單已付款");
        } else {
          message.error("藍新金流扣款失敗, 請稍後再試");
        }
      } catch (err) {
        message.error("藍新金流扣款失敗, 請稍後再試");
      }

      break;
  }
};

export default handlePayment;
