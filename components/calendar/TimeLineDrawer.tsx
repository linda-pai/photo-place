import React, { useState } from "react";
import { Timeline, Drawer } from "antd";
import { CloseCircleOutlined, DoubleRightOutlined } from "@ant-design/icons";
import EventJson from "@/static/eventData.json";

const TimeLineDrawer = ({ setCurrEvent }: any) => {
  const [open, setOpen] = useState(false);

  const showDrawer = () => {
    setOpen(true);
    setCurrEvent(null);
  };

  const onClose = () => {
    setOpen(false);
  };

  return (
    <>
      <div
        className="p-2 rounded-br-md rounded-tr-md border h-fit w-10 absolute left-0 top-[5.5rem] lg-top-auto hover:cursor-pointer"
        onClick={showDrawer}
      >
        <p className="lg:block hidden">顯示時間軸</p>
        <p className="lg:hidden block">
          <DoubleRightOutlined />
        </p>
      </div>
      <Drawer
        title={
          <div className="flex justify-between">
            <span>賽事時間軸</span>
            <CloseCircleOutlined onClick={onClose} />
          </div>
        }
        placement={"left"}
        closable={false}
        onClose={onClose}
        open={open}
      >
        <Timeline
          className="max-h-[80vh] overflow-scroll text-slate-600 p-4 w-fit ml-[-40%]"
          items={EventJson.map((event) => {
            return {
              children: event.url ? (
                <a href={event.url || undefined} target="_blank">
                  <h3>{event.eventName}</h3>
                </a>
              ) : (
                <h3>{event.eventName}</h3>
              ),
              label: event.date,
            };
          })}
          mode="left"
        />
      </Drawer>
    </>
  );
};

export default TimeLineDrawer;
