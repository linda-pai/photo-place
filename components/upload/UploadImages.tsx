import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { setCookie, getCookie } from "cookies-next";
import {
  Input,
  InputNumber,
  Button,
  Progress,
  Spin,
  message,
  Modal,
  Steps,
  Table,
} from "antd";
import {
  ExclamationCircleOutlined,
  SmileOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import parallelUploadWithLimit from "@/utils/parallelUploadWithLimit";
import addWatermark from "@/lib/upload/addWatermark";
import { writeUploadInfo } from "@/lib/upload/writeUploadInfo";
import imagesRelease from "@/lib/upload/imagesRelease";
import UploadQueue from "@/lib/upload/uploadQueue";
import completeUpload from "@/lib/upload/completeUpload";

const Uploader = dynamic(() => import("@/components/upload/Uploader"), {
  loading: () => <Spin />,
});

const UploadBreadcrumb = dynamic(
  () => import("@/components/UploadBreadcrumb"),
  {
    loading: () => <Spin />,
  }
);

const UploadImages = ({ eventId }: { eventId: string }) => {
  const { data: session }: any = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [fileOptionsList, setFileOptionsList] = useState([] as any);
  const [completeCount, setCompleteCount] = useState(0);
  const [detectCount, setDetectCount] = useState(0);

  const [modal, contextHolder] = Modal.useModal();
  const [authorName, setAuthorName] = useState(session?.user?.name || "");
  const [price, setPrice] = useState(159);
  const [eventName, setEventName] = useState("");

  const msgKey = Math.random().toString();

  useEffect(() => {
    setAuthorName(session?.user?.name || "");
  }, []);

  useEffect(() => {
    if (!eventId) return handleEventIdError();
    fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/events/getBy/${eventId}`)
      .then((res) => res.json())
      .then((data) => {
        const { eventName } = data;
        if (!eventName) return handleEventIdError();
        setEventName(eventName);
      });
  }, [eventId]);

  useEffect(() => {
    const uploadData = JSON.parse(getCookie("uploadInfo") || "[]");
    setFileOptionsList(uploadData);
    setCompleteCount(
      uploadData.filter((file: any) => file.uploaded).length || 0
    );
  }, []);

  const handleEventIdError = () => {
    message.error("請選擇活動");
    setTimeout(() => {
      router.push("/photographer/chooseEvent");
    }, 1000);
  };

  const handleChangeAuthorName = (e: any) => setAuthorName(e.target.value);
  const handleChangePrice = (value: any) => setPrice(value);

  const handleOnUploaderChange = async (imageFile: File[]) => {
    //overwrite fileOptionsList with new files when has same path
    const originList = fileOptionsList.filter(
      (file: any) =>
        !imageFile.find((newFile: any) => {
          if (newFile?.name === file?.name) {
            message.error(`${newFile.name}已存在`);
            return true;
          }
          if (newFile?.path === file?.path) {
            if (file.uploaded) {
              message.error(`${file.path}已上傳`);
              return false;
            } else {
              message.error(`${newFile.name}重新選取成功`);
              return true;
            }
          }
        })
    );

    const concatedList = [...originList, ...imageFile];
    const newFileOptionsList = concatedList.filter(
      (file: any, index: number, self: any) =>
        index === self.findIndex((t: any) => t.path === file.path)
    );
    setFileOptionsList(newFileOptionsList);

    //set in cookie
    setCookie("uploadInfo", JSON.stringify(newFileOptionsList));
  };

  const handleOnFinishAll = async () => {
    console.timeEnd("upload");

    setLoading(false);
    message.success("全部上傳完成🎉🎉");
    message.destroy(msgKey);

    modal.confirm({
      title: `已上傳完成${fileOptionsList.length}張照片`,
      icon: <ExclamationCircleOutlined />,
      content: `是否要發佈${fileOptionsList.length}張照片？`,
      okText: "確認",
      onOk: handleRelease,
    });
  };

  //add watermark and upload after detect text
  const handleAddWatermarkandUpload = async (key: string, file: File) => {
    const reqBody = {
      key,
      eventId,
      eventName,
      fileName: file.name,
      lastModified: file.lastModified,
      author: session.id,
      authorName,
      price,
    };
    const addWaterMarkFunction = async () =>
      await addWatermark(reqBody).then((res) => {
        if (res.error) {
          message.error(res.error);
          return;
        }
        setDetectCount((prev) => {
          if (prev + 1 === fileOptionsList.length) handleOnFinishAll();
          return prev + 1;
        });
      });

    const uploadQueue = new UploadQueue("addWaterMark", addWaterMarkFunction);
    uploadQueue.enqueue([file]);
  };

  const handleCompleteUpload = async (
    key: string,
    file: File,
    uploadPartsArray: any[],
    uploadId: string
  ) => {
    const completeFunction = async () =>
      await completeUpload(key, uploadPartsArray, uploadId).then((res) => {
        if (res.error) {
          message.error(res.error);
          return;
        }
        setFileOptionsList((prev: any) => {
          const newFileOptionsList = prev.map((item: any) =>
            item.name && item.name === file.name
              ? { ...item, uploaded: true }
              : item
          );
          setCookie("uploadInfo", JSON.stringify(newFileOptionsList));
          return newFileOptionsList;
        });

        setCompleteCount((prev) => prev + 1);

        handleAddWatermarkandUpload(key, file);
      });

    const uploadQueue = new UploadQueue("complete", completeFunction);
    uploadQueue.enqueue([file]);
  };

  const chunkFileAndUpload = async (
    file: File,
    uploadId: string,
    key: string
  ) => {
    //2. chunk image withe each 5MB and upload
    const chunkSize = 5 * 1024 * 1024;
    const NUM_CHUNKS = Math.floor(file.size / chunkSize) + 1;

    let promisesArray = [] as any;
    let uploadPartsArray = [] as any;

    //upload each chunk
    for (let i = 1; i < NUM_CHUNKS + 1; i++) {
      const start = (i - 1) * chunkSize;
      const end = i * chunkSize;
      const chunk = i < NUM_CHUNKS ? file.slice(start, end) : file.slice(start);

      //get presigned url
      await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/get-upload-url?uploadId=${uploadId}&fileName=${file.name}&partNumber=${i}&key=${key}`
      )
        .then((res) => res.json())
        .then((result) => {
          //put chunk to presigned url
          const { preSignedURL } = result;
          let uploadResp = fetch(preSignedURL, {
            method: "PUT",
            body: chunk,
            headers: {
              "Content-Type": "image/*",
            },
          }).then((data) => data);

          promisesArray.push(uploadResp);
        });
    }

    await Promise.all(promisesArray).then((resolvedArray: any[]) => {
      resolvedArray.forEach((resolvedPromise, index) => {
        uploadPartsArray.push({
          ETag: resolvedPromise.headers.get("ETag"),
          PartNumber: index + 1,
        });
      });
    });

    //complete-upload
    handleCompleteUpload(key, file, uploadPartsArray, uploadId);
    return;
  };

  const handleUpload = async () => {
    if (!session.id) return message.error("請先登入");
    if (!eventId) return message.error("請選擇活動");

    const tobeUploadedList = fileOptionsList.filter((file: any) => file.type);

    modal.confirm({
      title: "上傳照片",
      icon: <ExclamationCircleOutlined />,
      content: `確定要上傳${tobeUploadedList.length}張照片嗎？`,
      okText: "確認",
      cancelText: "取消",
      onOk: () => {
        setLoading(true);

        const reqBody = {
          eventId,
          eventName,
          author: session.id,
          name: authorName,
        };
        writeUploadInfo(reqBody);

        const loadingMsgConfig = {
          key: msgKey,
          content: "上傳中...",
          duration: 0,
        };
        message.open({ ...loadingMsgConfig, type: "loading" });
        //寫入上傳資訊
        //50張一組，完成後再上傳下一組
        console.time("upload");
        const groupLimit = 50;
        parallelUploadWithLimit(
          eventId,
          tobeUploadedList,
          groupLimit,
          chunkFileAndUpload
        );
      },
      onCancel: () => {},
    });
  };

  const handleRelease = async () => {
    setLoading(true);

    const loadingMsgConfig = {
      key: msgKey,
      content: "發佈中...",
      duration: 0,
    };
    message.open({ ...loadingMsgConfig, type: "loading" });
    // modal.confirm({
    //   title: "發佈照片",
    //   icon: <ExclamationCircleOutlined />,
    //   content: `確定要發佈${fileOptionsList.length}張照片嗎？`,
    //   okText: "確認",
    //   cancelText: "取消",
    //   onOk: () => {

    //   },
    // });

    imagesRelease(eventId).then((response: any) => {
      if (response?.error) {
        message.error(response?.error);
        return;
      }

      message.success("發佈成功🎉🎉");
      message.destroy(msgKey);
      setLoading(false);
      setFileOptionsList([]);
      setCookie("uploadInfo", JSON.stringify([]));

      modal.confirm({
        title: `已發佈${fileOptionsList.length}張照片`,
        icon: <ExclamationCircleOutlined />,
        content: `是否要前往活動頁面？`,
        okText: "確認",
        cancelText: "取消",
        onOk: () => {
          window.location.href = `/events/${eventId}`;
        },
        onCancel: () => {},
      });
    });
  };

  const currentStep =
    detectCount > 0
      ? detectCount === fileOptionsList.length
        ? 2
        : 1
      : (0 as 0 | 1 | 2 | undefined);

  const steps = [
    {
      title: "上傳中",
      description: "照片上傳中",
      subTitle: `${completeCount}/${fileOptionsList.length}張照片`,
      // subTitle: `剩餘時間: ${
      //   Math.ceil((fileOptionsList.length - completeCount) * 3) / 60 < 1
      //     ? Math.ceil((fileOptionsList.length - completeCount) * 3) + "秒"
      //     : Math.ceil((fileOptionsList.length - completeCount) * 3) / 60 + "分"
      // }
    },
    {
      title: "偵測中",
      description: "號碼布偵測中",
      subTitle: `${detectCount}/${fileOptionsList.length}張照片`,
    },
    {
      title: "完成",
      description: "上傳完成",
      icon: (
        <SmileOutlined style={currentStep === 2 ? { color: "#ffd700" } : {}} />
      ),
      status: currentStep === 2 ? "finish" : "wait",
    },
  ] as any;

  const currentPercent = Math.ceil(
    ((currentStep === 0
      ? completeCount
      : currentStep === 1
      ? detectCount
      : fileOptionsList.length) /
      fileOptionsList.length) *
      100
  );

  const columns = [
    {
      title: "檔案名稱",
      dataIndex: "path",
      key: "path",
      sorter: (a: any, b: any) => a.path?.localeCompare(b.path),
    },

    {
      title: "上傳進度",
      dataIndex: "uploaded",
      key: "uploaded",
      render: (uploaded: string, record: any) => {
        return record.type?.includes("image") ? (
          <Progress percent={uploaded ? 100 : 0} />
        ) : (
          <>
            {uploaded ? (
              <Progress percent={100} />
            ) : (
              <>
                請重新選取檔案
                <ExclamationCircleOutlined />
              </>
            )}
          </>
        );
      },
      sorter: (
        a: any,
        b: any //boolean
      ) => (a.uploaded ? 1 : b.uploaded ? -1 : 0),
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      render: (text: string, record: any) => (
        <>
          <Button
            onClick={() => {
              const newFileOptionsList = fileOptionsList.filter(
                (file: any) => file.path !== record.path
              );
              setFileOptionsList(newFileOptionsList);
              setCookie("uploadInfo", JSON.stringify(newFileOptionsList));
            }}
            className="flex items-center"
            disabled={record.uploaded}
          >
            <DeleteOutlined />
            <p className="sm:block hidden">&nbsp;移除</p>
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="mt-24 container mx-auto px-4">
      <UploadBreadcrumb />
      <div className="text-center">
        <div className="my-8">
          <h2 className="max-w-[400px] mx-auto text-lg text-[color:var(--main-color-dark)]">
            {eventName}
          </h2>
        </div>
        <div>
          <Input
            placeholder="攝影師名稱"
            className="w-1/3"
            onChange={handleChangeAuthorName}
            value={authorName}
            defaultValue={authorName || ""}
            addonBefore="攝影師名稱"
          />
        </div>
        <div>
          <InputNumber
            placeholder="照片價格"
            className="w-1/3 my-2"
            onChange={handleChangePrice}
            value={price}
            defaultValue={price || ""}
            addonBefore="照片價格"
          />
        </div>
      </div>
      <div className="text-center mx-auto my-10  max-w-[800px] min-h-[30vh]">
        <Uploader
          onChange={handleOnUploaderChange}
          filesList={fileOptionsList}
          loading={loading}
        />
        <Button
          //TODO: disabled={fileOptionsList.length === 0 || loading}
          disabled={fileOptionsList.length === 0}
          onClick={handleUpload}
        >
          確定上傳
        </Button>
      </div>

      {fileOptionsList.length > 0 && (
        <>
          <div className="text-center text-[color:var(--main-color-dark)]">
            <Steps
              current={currentStep}
              className="w-4/5 mx-auto"
              percent={currentPercent}
              items={steps}
            />

            <Table
              dataSource={fileOptionsList
                .map((file: any, key: number) => {
                  return {
                    path: file.path,
                    key,
                    uploaded: file.uploaded,
                    type: file.type,
                  };
                })
                // .sort((a: any, b: any) => a.uploaded?.localeCompare(b.uploaded))}
                .sort((a: any, b: any) =>
                  a.uploaded ? 1 : b.uploaded ? -1 : 0
                )}
              columns={columns}
              pagination={{
                defaultPageSize: 50,
                pageSizeOptions: ["50", "100", "200", "500", "1000"],
                position: ["bottomCenter"],
              }}
              className="w-2/3 mx-auto my-10 max-h-[50vh] overflow-y-auto"
            />
          </div>
        </>
      )}

      {contextHolder}
    </div>
  );
};

export default UploadImages;
