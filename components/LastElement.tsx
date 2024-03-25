import React, { useCallback, useRef } from "react";
import { Spin } from "antd";

const LastElement: React.FC<{
  isLoading: boolean;
  intersectionFunc: () => void;
}> = ({ isLoading, intersectionFunc }) => {
  const observer = useRef<IntersectionObserver>();

  const lastElementRef = useCallback(
    (node: HTMLDivElement) => {
      //如果載入中的話就return
      if (isLoading) return;
      //先把observer斷開(一般來說，useRef會是抓陣列的最後10個)
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setTimeout(() => {
              intersectionFunc();
            }, 500);
          }
        },
        {
          threshold: 1,
        }
      );
      //重新把新增完資料的node接上
      if (node) observer.current.observe(node);
    },
    [isLoading]
  );

  return (
    !isLoading && (
      <div ref={lastElementRef} className="text-center my-10">
        <Spin />
      </div>
    )
  );
};

export default LastElement;
