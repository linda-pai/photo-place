import { useEffect } from "react";
import Router from "next/router";
import { Modal } from "antd";

const UploadPrompt = ({
  isUploading,
  onConfirmLeave,
}: {
  isUploading: boolean;
  onConfirmLeave: () => void;
}) => {
  const [modal, contextHolder] = Modal.useModal();
  const confirmModal = ({
    onCancel,
    onOk,
  }: {
    onCancel: () => void;
    onOk: () => void;
  }) => {
    modal.confirm({
      title: "確認離開",
      content: "尚未完成上傳，確定要離開嗎？",
      onOk,
      onCancel,
    });
  };

  useEffect(() => {
    const onBeforeUnload = (e: any) => {
      if (isUploading) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [isUploading]);

  useEffect(() => {
    const routeChangeStart = (url: string) => {
      if (isUploading) {
        confirmModal({
          onCancel: () => {
            Router.events.emit("routeChangeComplete");
          },
          onOk: () => {
            onConfirmLeave();
            Router.push(url);
            //remove event listener
            Router.events.off("routeChangeStart", routeChangeStart);
          },
        });
        throw "Abort route change. Please ignore this error.";
      }
    };

    Router.events.on("routeChangeStart", routeChangeStart);

    return () => {
      Router.events.off("routeChangeStart", routeChangeStart);
    };
  }, [isUploading]);

  return contextHolder;
};

export default UploadPrompt;
