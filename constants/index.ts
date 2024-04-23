const paymentConst = {
  LINEPAY: 2,
  NEWEBPAY: 3,
};

const CHARGE_PERCENTAGE = 0.04;

const IMAGE_STATUS = {
  IDENTIFYED: 3,
  UNIDENTIFYED: 4,
  MORE: 5,
  // RECOGNIZED: 1,
  // UNRECOGNIZED: 3,
};

const DEFAULT_COVER_IMG =
  "https://photo-pacer-buckets.s3.ap-northeast-1.amazonaws.com/images-dev/common/8180dbf5c144f6ad3a8eadc4508ecc307fedbd361741c37104da3484fb93773c-photo-pacer-high-resolution-logo%20%282%29%20%282%29.png";

const SITE_NAME = "Photo Pacer 攝影小隊";

export {
  paymentConst,
  CHARGE_PERCENTAGE,
  IMAGE_STATUS,
  DEFAULT_COVER_IMG,
  SITE_NAME,
};
