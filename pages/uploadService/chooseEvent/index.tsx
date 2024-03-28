import { useState } from "react";
import { useRouter } from "next/router";
import { Select, Button, Spin, Divider } from "antd";
import dynamic from "next/dynamic";

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

interface SelectOption {
  value: string;
  label: string;
}

const chooseEvent = ({ eventOption }: { eventOption: Event[] }) => {
  const router = useRouter();
  const [eventId, setEventId] = useState({ value: "", label: "" });
  const [eventOptions, setEventOptions] = useState(eventOption as Event[]);

  const handleSelected = (obj: SelectOption) =>
    setEventId({ value: obj.value, label: obj.label });

  const getEventOptions = async () => {
    const domain = process.env.NEXT_PUBLIC_SERVER_URL;
    await fetch(`${domain}/api/events/getEventOptions`)
      .then((res) => res.json())
      .then((data) => {
        setEventOptions(data);
      });
  };

  return (
    <div className="mt-24 text-center container mx-auto px-4">
      <UploadBreadcrumb />
      <div className="text-center mx-auto mt-32 max-w-[800px] min-h-[30vh] text-[var(--main-color-dark)] text-lg">
        <h1>請選擇您拍攝的賽事相簿</h1>
        <div className="my-4">
          <Select
            labelInValue
            placeholder="請選擇活動"
            className="w-1/3 "
            onChange={handleSelected}
            options={eventOptions.map((event: any) => ({
              label: event.eventName,
              value: event.eventId,
            }))}
          />
        </div>

        <Button
          onClick={() => {
            router.push(
              `/uploadService/chooseEvent/upload?eventId=${eventId.value}`
            );
          }}
          className="my-10"
          disabled={!eventId.value}
        >
          下一步
        </Button>
        <Divider />
        <div className="mt-16">
          <div className="">
            <p>找不到您所拍攝的賽事？創建一個賽事：</p>
            <p className="text-sm text-[var(--main-color-light)]">
              註：需等待管理員審核後才會顯示在首頁
            </p>
          </div>
          <CreateEventBlock
            handleOnSuccess={() => getEventOptions()}
            isShowImageUpload={false}
          />
        </div>
      </div>
    </div>
  );
};

export async function getServerSideProps(context: any) {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const res = await fetch(`${domain}/api/events/getEventOptions`);
  const eventOption = await res.json();

  return { props: { eventOption } };
}

export default chooseEvent;
