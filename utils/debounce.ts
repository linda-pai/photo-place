const debounce = (callback: any, delay = 1500) => {
  let timeout: any;

  return (...args: any) => {
    clearTimeout(timeout); // 清除先前的計時器，以確保 callback 只在延遲時間後調用一次
    timeout = setTimeout(() => {
      callback(...args);
    }, delay);
  };
};

export default debounce;
