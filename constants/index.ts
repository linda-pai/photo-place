const paymentConst = {
  LINEPAY: 2,
  NEWEBPAY: 3,
};

const CHARGE_PERCENTAGE = 0.04;

const IMAGE_STATUS = {
  IDENTIFYED: 3,
  UNIDENTIFYED: 4,
  MORE: 5,
  ALL: 0,
  // RECOGNIZED: 1,
  // UNRECOGNIZED: 3,
};

const CHARGE_TYPE = {
  PAY_AS_YOU_GO: 1,
  REVENEUE_SHARING: 2,
};

const DEFAULT_COVER_IMG =
  "https://photo-pacer-buckets.s3.ap-northeast-1.amazonaws.com/images-dev/common/8180dbf5c144f6ad3a8eadc4508ecc307fedbd361741c37104da3484fb93773c-photo-pacer-high-resolution-logo%20%282%29%20%282%29.png";

const DETECTING_IMG =
  "https://photo-pacer-buckets.s3.ap-northeast-1.amazonaws.com/images-dev/common/fff22b999b5cefd76c3931c084a0a0865245ce2cb75f0b855bdc3a1a89ca74bb-detecting.png";

const SITE_NAME = "Photo Pacer 攝影小隊";

export {
  paymentConst,
  CHARGE_PERCENTAGE,
  IMAGE_STATUS,
  CHARGE_TYPE,
  DEFAULT_COVER_IMG,
  DETECTING_IMG,
  SITE_NAME,
};
