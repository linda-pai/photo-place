const paymentOptions = [
  {
    label: "銀行轉帳",
    value: 0,
    fee: 0,
    // extension: <Input style={{ width: 100, marginLeft: 10 }} />,
  },
  { label: "信用卡 ( 即將上線 )", value: 1, fee: 0, disabled: true },
  {
    label: "Line Pay ( 即將上線 )",
    value: 2,
    fee: 30,
    disabled: true,
  },
];

export default paymentOptions;
