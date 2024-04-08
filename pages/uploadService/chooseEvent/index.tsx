import { useState } from "react";
import { useRouter } from "next/router";
import { TreeSelect, Button, Spin } from "antd";
import dynamic from "next/dynamic";
import dayjs from "dayjs";
import userPermission from "@/hooks/usePermission";

const UploadBreadcrumb = dynamic(
  () => import("@/components/UploadBreadcrumb"),
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

  return isAllowed ? (
    <div className="mt-24 container mx-auto px-4">
      <UploadBreadcrumb />
      <div className="text-center mx-auto mt-32 max-w-[800px] min-h-[50vh] text-[var(--main-color-dark)] text-lg">
        <h1>請選擇您拍攝的賽事相簿</h1>
        <div className="my-4">
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

  const removeDuplicate = (arr: any) => {
    return arr.filter(
      (v: any, i: any, a: any) =>
        a.findIndex((t: any) => t.value === v.value) === i
    );
  };
  const years = eventOption.map(
    (event: { date: string; eventName: string; eventId: string }) => {
      return {
        value: dayjs(event.date).format("YYYYMM"),
        title: dayjs(event.date).format("YYYY年MM月"),
        children: [],
      };
    }
  );

  const yearsData = removeDuplicate(years);

  const months = eventOption.map(
    (event: { date: string; eventName: string; eventId: string }) => {
      return {
        value: dayjs(event.date).format("M"),
        title: dayjs(event.date).format("M月"),
        children: [],
      };
    }
  );
  const monthsData = removeDuplicate(months);

  eventOption.forEach(
    (event: { date: string; eventName: string; eventId: string }) => {
      const yearIndex = yearsData.findIndex(
        (year: { value: string }) =>
          year.value === dayjs(event.date).format("YYYYMM")
      );
      const monthIndex = monthsData.findIndex(
        (month: { value: string }) =>
          month.value === dayjs(event.date).format("M")
      );
      yearsData[yearIndex].children.push({
        value: event.eventId,
        title: event.eventName,
        date: event.date,
      });
      monthsData[monthIndex].children.push({
        value: event.eventId,
        title: event.eventName,
        date: event.date,
      });
    }
  );

  return { props: { eventOption: yearsData } };
}

export default chooseEvent;
