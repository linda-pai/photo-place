import { paymentConst } from "@/constants";

const paymentOptions = [
  {
    label: "Line Pay",
    value: paymentConst.LINEPAY,
    fee: 0,
    // disabled: false,
    icon: "https://photo-pacer-buckets.s3.ap-northeast-1.amazonaws.com/images/common/db94adef33eeb955e86704a49bfda5fbb09ef69b4d59c52faaa63b77d6c4bf2b-LINE-Pay%28h%29_W119_n.png",
    desc: "（Line Pay、一卡通 iPass MONEY）",
  },
  {
    label: "藍新金流",
    value: paymentConst.NEWEBPAY,
    fee: 0,
    // disabled: false,
    icon: "https://photo-pacer-buckets.s3.ap-northeast-1.amazonaws.com/images/common/5df93446d0bd97054a1e0b330168ee9f0af1b4b490bb1466d2a18b4d77767acf-spgateway_logo.png",
    desc: "（信用卡、超商條碼繳費、超商代碼繳費、ATM轉帳、WebATM）",
  },
];

export default paymentOptions;
