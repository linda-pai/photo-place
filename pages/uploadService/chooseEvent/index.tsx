import { useState } from "react";
import { useRouter } from "next/router";
import { TreeSelect, Button, Spin, Divider, message } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import dynamic from "next/dynamic";
import userPermission from "@/hooks/usePermission";
import formatOptions from "@/lib/event/formatOptions";

const UploadBreadcrumb = dynamic(
  () => import("@/components/UploadBreadcrumb"),
  {
    loading: () => <Spin />,
  }
);

const CreateEventBlock = dynamic(
  () => import("@/components/event/CreateEventBlock"),
  {
    loading: () => <Spin />,
  }
);

const chooseEvent = ({ eventOption }: { eventOption: Event[] }) => {
  const isAllowed = userPermission();

  const router = useRouter();
  const [eventId, setEventId] = useState<string>();
  const [eventOptions, setEventOptions] = useState(eventOption as Event[]);

  const handleSelected = (value: string) => setEventId(value);

  const fetchEventOptions = async () => {
    const domain = process.env.NEXT_PUBLIC_SERVER_URL;
    const eventOption = await fetch(`${domain}/api/events/getEventOptions`)
      .then((res) => res.json())
      .then((data) => {
        message.success("賽事列表已更新");
        return data;
      });

    const formatted = formatOptions(eventOption);

    setEventOptions(formatted);
  };

  return isAllowed ? (
    <div className="mt-24 container mx-auto px-4">
      <UploadBreadcrumb />
      <div className="text-center mx-auto mt-32 max-w-[800px] min-h-[50vh] text-[var(--main-color-dark)] text-lg">
        <h1>請選擇您拍攝的賽事相簿</h1>
        <div className="my-4 flex">
          <Button
            onClick={fetchEventOptions}
            className="flex items-center mx-1"
          >
            <ReloadOutlined />
          </Button>
          <TreeSelect
            showSearch
            style={{ width: "100%" }}
            value={eventId}
            dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
            treeData={eventOptions}
            placeholder="請選擇賽事或搜尋"
            allowClear
            onChange={handleSelected}
            filterTreeNode={(search, item: any) =>
              item.title.toLowerCase().indexOf(search.toLowerCase()) >= 0
            }
            treeDefaultExpandAll
          />
        </div>

        <Button
          onClick={() => {
            router.push(`/uploadService/chooseEvent/upload?eventId=${eventId}`);
          }}
          className="my-10"
          disabled={!eventId}
        >
          下一步
        </Button>
        <Divider />
        <div className="my-16">
          <div>
            <p>找不到您所拍攝的賽事？創建一個賽事：</p>
            <p className="text-sm text-[var(--main-color-light)]">
              註：需等待管理員審核後才會顯示在列表中
            </p>
            <CreateEventBlock
              handleOnSuccess={() => {}}
              isShowImageUpload={false}
            />
          </div>
        </div>
      </div>
    </div>
  ) : (
    <Spin className="mx-auto my-[40vh] w-full" size="large" />
  );
};

export async function getServerSideProps(context: any) {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const res = await fetch(`${domain}/api/events/getEventOptions`);
  const eventOption = await res.json();

  const formatted = formatOptions(eventOption);
  return { props: { eventOption: formatted } };
}

export default chooseEvent;
