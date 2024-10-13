import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
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
import addWaterMarkAndDetect from "@/lib/upload/addWaterMarkAndDetect";
import {
  writeUploadInfo,
  writeUploadProgress,
  getUploadProgress,
} from "@/lib/upload/writeUploadInfo";
import UploadQueue from "@/lib/upload/uploadQueue";
import completeUpload from "@/lib/upload/completeUpload";
import getStartMultipartUploadURL from "@/lib/upload/getStartMultipartUploadURL";
import chunkFileAndPutS3 from "@/lib/upload/chunkFileAndPutS3";
import isUploadable from "@/utils/isUploadable";
import {
  getAuthorDisplayName,
  setAuthorDisplayName,
} from "@/lib/photographer/displayName";

const Uploader = dynamic(() => import("@/components/upload/Uploader"), {
  loading: () => <Spin />,
});

const UploadBreadcrumb = dynamic(
  () => import("@/components/UploadBreadcrumb"),
  {
    loading: () => <Spin />,
  }
);

const UploadPrompt = dynamic(() => import("@/components/UploadPrompt"), {
  loading: () => <Spin />,
});

const UploadImages = ({ eventId, date }: { eventId: string; date: string }) => {
  const { data: session }: any = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [fileOptionsList, setFileOptionsList] = useState([] as any);
  const [completeCount, setCompleteCount] = useState(0);

  const [modal, contextHolder] = Modal.useModal();
  const [authorName, setAuthorName] = useState(session?.user?.name || "");
  const [price, setPrice] = useState(169);
  const [eventName, setEventName] = useState("");

  const msgKey = Math.random().toString();

  useEffect(() => {
    //get user Name
    if (!session?.id) return;
    getAuthorDisplayName(session.id).then((data) =>
      setAuthorName(data?.displayName || session?.user?.name)
    );
  }, [session]);

  useEffect(() => {
    if (!eventId) return handleEventIdError();
    fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/events/getBy/${eventId}`)
      .then((res) => res.json())
      .then((data) => {
        const { eventName, date } = data || {};
        if (!eventName) return handleEventIdError();
        if (!isUploadable(date)) return handleNotUploadable();
        setEventName(eventName);
      });
  }, [eventId]);

  useEffect(() => {
    const fetchUploadProgress = async () => {
      const uploadData = await getUploadProgress(eventId, session.id);
      setFileOptionsList(uploadData || []);
      setCompleteCount(
        uploadData.filter((file: any) => file.uploaded).length || 0
      );
    };
    fetchUploadProgress();
  }, []);

  const handleEventIdError = () => {
    message.error("請選擇活動");
    setTimeout(() => {
      router.push("/uploadService/chooseEvent");
    }, 1000);
  };

  const handleNotUploadable = () => {
    message.error("此活動已關閉上傳功能");
    setTimeout(() => {
      router.push("/uploadService/chooseEvent");
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
    const reqBody = {
      eventId,
      author: session.id,
      progress: newFileOptionsList,
    };

    writeUploadProgress(reqBody);
  };

  const handleOnFinishAll = async () => {
    console.timeEnd("upload");

    setLoading(false);
    message.success("全部上傳完成🎉🎉");
    message.destroy(msgKey);

    addWaterMarkAndDetect({
      eventId,
      author: session.id,
      isAll: false,
    });

    modal.confirm({
      title: `已上傳完成${fileOptionsList.length}張照片`,
      icon: <ExclamationCircleOutlined />,
      content:
        "提醒您：相簿精選照片，預設為您上傳照片排序前50張， \n 如要變更，請至[攝影師成就 -> 編輯]挑選精選照片",
      okText: "編輯照片",
      onOk: () => {
        router.push(`/photographer/checkBibs?eventId=${eventId}&date=${date}`);
      },
      cancelText: "繼續上傳",
    });
  };

  const handleCompleteUpload = async (
    uploadData: any,
    file: File,
    uploadPartsArray: any[],
    uploadId: string
  ) => {
    const completeFunction = async () =>
      await completeUpload(uploadData, uploadPartsArray, uploadId).then(
        (res) => {
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
            const reqBody = {
              eventId,
              author: session.id,
              progress: newFileOptionsList,
            };

            writeUploadProgress(reqBody);
            return newFileOptionsList;
          });

          setCompleteCount((prev) => {
            if (prev + 1 === fileOptionsList.length) handleOnFinishAll();
            return prev + 1;
          });
        }
      );

    const uploadQueue = new UploadQueue("complete", completeFunction);
    uploadQueue.enqueue([file]);
  };

  const handleChunkFileAndUpload = async (
    file: File,
    uploadId: string,
    key: string
  ) => {
    //2. chunk image withe each 5MB and upload
    const uploadPartsArray = await chunkFileAndPutS3(file, uploadId, key);
    //complete-upload - s3 multipart upload requires complete upload

    const uploadData = {
      key,
      eventId,
      eventName,
      author: session.id,
      authorName,
      price,
      fileName: file.name,
      lastModified: file.lastModified,
    };
    return await handleCompleteUpload(
      uploadData,
      file,
      uploadPartsArray,
      uploadId
    );
  };

  const chunkFileAndUpload = async (file: File) => {
    const fileName = file.name;
    const path = `/${eventId}/`;

    const uploadFunction = async () => {
      const { key, uploadId } = await getStartMultipartUploadURL(
        path,
        fileName
      ).then((res) => {
        if (res.error) {
          message.error(res.error);
          return;
        }
        return res;
      });
      await handleChunkFileAndUpload(file, uploadId, key);
    };

    const startAndUploadQueue = new UploadQueue("startUpload", uploadFunction);
    return await startAndUploadQueue.asyncEnqueue(file);
  };

  const handleUpload = async () => {
    if (!session.id) return message.error("請先登入");
    if (!eventId) return message.error("請選擇活動");
    if (!authorName) return message.error("請輸入攝影師名稱");

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
        //100張一組，完成後再上傳下一組
        console.time("upload");
        const groupLimit = 500;
        parallelUploadWithLimit(
          tobeUploadedList,
          groupLimit,
          chunkFileAndUpload
        );
      },
      onCancel: () => {},
    });
  };

  const onConfirmLeave = () => {
    message.destroy();
  };

  const currentStep = completeCount === fileOptionsList.length ? 1 : 0;

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
      title: "完成",
      description: "上傳完成",
      icon: (
        <SmileOutlined style={currentStep === 1 ? { color: "#ffd700" } : {}} />
      ),
      status: currentStep === 1 ? "finish" : "wait",
    },
  ] as any;

  const currentPercent = Math.ceil(
    (completeCount / fileOptionsList.length) * 100
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
      defaultSortOrder: "descend",
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

              const reqBody = {
                eventId,
                author: session.id,
                progress: newFileOptionsList,
              };

              writeUploadProgress(reqBody);
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
      {
        <>
          <UploadPrompt isUploading={loading} onConfirmLeave={onConfirmLeave} />
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
                onKeyDown={(e: any) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.target.blur();
                    setAuthorDisplayName(session.id, e.target.value);
                  }
                }}
                onBlur={(e) => setAuthorDisplayName(session.id, e.target.value)}
                value={authorName}
                defaultValue={authorName || ""}
                addonBefore="攝影師名稱"
                disabled={loading}
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
                disabled={loading}
              />
            </div>
          </div>
          <div className="text-center mx-auto my-10 max-w-[500px] min-h-[30vh]">
            <Uploader onChange={handleOnUploaderChange} loading={loading} />
            <Button
              disabled={
                fileOptionsList.filter((file: any) => file.type).length === 0 ||
                loading
              }
              onClick={handleUpload}
              className="my-10 bg-[color:var(--main-color-dark)] text-white w-1/4 text-lg h-auto"
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
                  columns={columns as any}
                  pagination={{
                    defaultPageSize: 50,
                    pageSizeOptions: ["50", "100", "200"],
                    position: ["bottomCenter"],
                  }}
                  className="w-2/3 mx-auto my-10 max-h-[50vh] overflow-y-auto"
                />
              </div>
            </>
          )}
        </>
      }

      {contextHolder}
    </div>
  );
};

export default UploadImages;
