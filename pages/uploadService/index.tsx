import { Button, Checkbox } from "antd";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { Spin } from "antd";

const UploadBreadcrumb = dynamic(
  () => import("@/components/UploadBreadcrumb"),
  {
    loading: () => <Spin />,
  }
);

const uploadService = () => {
  const router = useRouter();

  return (
    <div className="mt-24 text-center container mx-auto px-4">
      <UploadBreadcrumb />
      <div className="text-center mx-auto my-10  max-w-[800px] min-h-[30vh]">
        <h1>Upload Service Description</h1>
        <div>
          <Checkbox>我已閱讀並同意服務條款</Checkbox>
        </div>

        <Button
          onClick={() => {
            router.push("/uploadService/chooseEvent");
          }}
          className="my-10"
        >
          下一步
        </Button>
      </div>
    </div>
  );
};

export default uploadService;
