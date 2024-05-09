import React, { useState } from "react";
import { Table, Space, Button, Tag, Modal, message, Spin } from "antd";
import { ExclamationCircleOutlined, CopyOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { Order } from "@/types/interfaces/CartDataProps";
import copyToClipboard from "@/utils/copyToClipboard";
import paymentOptions from "@/utils/paymentOptions";
import updateOrderData from "@/lib/order/updateOrderData";
import tableConfig from "./tableConfig";
import dynamic from "next/dynamic";
import { sha256 } from "js-sha256";

const ImageDetail = dynamic(() => import("./ImageDetail"), {
  loading: () => <Spin />,
});

const Editable = dynamic(() => import("@/components/cms/Editable"), {
  loading: () => <Spin />,
});

const OrderList = ({ orders, session }: { orders: Order[]; session: any }) => {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;

  const [orderData, setOrderData] = useState<Order[]>(orders);
  const [loading, setLoading] = useState(false);
  const [modal, contextHolder] = Modal.useModal();

  const [showImageViewer, setShowImageViewer] = useState<{
    [key: string]: boolean;
  }>({});
  const [currImgIndex, setCurrImgIndex] = useState(0); // [0, images.length - 1

  const handleClickImg = (images: any, orderId: string) => {
    setShowImageViewer((prev) => ({ ...prev, [orderId]: true }));
    setCurrImgIndex(images.findIndex((item: any) => item.id === images[0].id));
  };

  const columnsRenderMap = {
    rwd: {
      responsive: ["xs"],
      render: (_: any, record: any, key: number) => (
        <div className="flex flex-col gap-1">
          <p className="">訂單編號：{record.orderId}</p>

          <p className="">
            訂單成立：
            {record.createAt
              ? dayjs(record.createAt).format("YYYY-MM-DD HH:mm")
              : "-"}
          </p>
          <p className="">
            完成付款：
            {record.paidAt
              ? dayjs(record.paidAt).format("YYYY-MM-DD HH:mm")
              : "-"}
          </p>
          <p className="">訂購人：{record.orderBy}</p>
          <div className="flex gap-1 items-center">
            <p>
              付款方式：
              {
                paymentOptions.find(
                  (option: any) => option.value === record.paymentMethod
                )?.label
              }
            </p>
            <div>
              {record.paidAt ? (
                <Tag color="#B0B97A">已付款</Tag>
              ) : (
                <Tag color="#f0cf02">未付款</Tag>
              )}
            </div>
          </div>
          <p className="">訂單金額：{record.totalAmount} 元</p>
          <p className="flex">
            備註：
            <Editable
              item={record}
              targetId={record.orderId}
              text={record.remark}
              updateFunction={handleInputConfirm}
              handleRemarkChange={handleRemarkChange}
            />
          </p>

          <div className="flex gap-2 overflow-scroll mt-2">
            <ImageDetail
              images={record.items}
              isOpen={showImageViewer[record.orderId] || false}
              onClose={() =>
                setShowImageViewer((prev) => ({
                  ...prev,
                  [record.orderId]: false,
                }))
              }
              currImg={currImgIndex}
              handleClickImg={() =>
                handleClickImg(record.items, record.orderId)
              }
            />
          </div>
        </div>
      ),
      sorter: (a: Order, b: Order) => {
        const dateA = new Date(a.createAt);
        const dateB = new Date(b.createAt);
        return dateA.getTime() - dateB.getTime();
      },
    },
    orderId: {
      ellipsis: true,
      render: (text: string) => (
        <a
          onClick={() => copyToClipboard(text)}
          className="cursor-pointer"
          title="複製訂單編號"
        >
          <CopyOutlined className="mr-2" />
          {text}
        </a>
      ),
      responsive: ["sm"],
    },
    createAt: {
      sorter: (a: Order, b: Order) => {
        const dateA = new Date(a.createAt);
        const dateB = new Date(b.createAt);
        return dateA.getTime() - dateB.getTime();
      },
      render: (text: string) => (
        <p>{text ? dayjs(text).format("YYYY-MM-DD HH:mm") : "-"}</p>
      ),
      responsive: ["sm"],
    },
    paidAt: {
      sorter: (a: Order, b: Order) => {
        const dateA = new Date(a.paidAt);
        const dateB = new Date(b.paidAt);
        return dateA.getTime() - dateB.getTime();
      },
      render: (text: string) => (
        <p>{text ? dayjs(text).format("YYYY-MM-DD HH:mm") : "-"}</p>
      ),
      responsive: ["sm"],
    },
    orderBy: {
      ellipsis: true,
      render: (text: string) => (
        <p onClick={() => copyToClipboard(text)} className="cursor-pointer">
          {text}
        </p>
      ),
      responsive: ["sm"],
    },
    paymentMethod: {
      render: (text: string) => (
        <p>
          {paymentOptions.find((option: any) => option.value === text)?.label}
        </p>
      ),
      responsive: ["sm"],
    },
    items: {
      ellipsis: true,
      render: (_: string, { items, orderId }: Order) => (
        <ImageDetail
          images={items}
          isOpen={showImageViewer[orderId] || false}
          onClose={() =>
            setShowImageViewer((prev) => ({
              ...prev,
              [orderId]: false,
            }))
          }
          currImg={currImgIndex}
          handleClickImg={() => handleClickImg(items, orderId)}
        />
      ),
      responsive: ["sm"],
    },
    paymentStatus: {
      render: (text: string) => (
        <p>
          {text ? (
            <Tag color="green">已付款</Tag>
          ) : (
            <Tag color="volcano">未付款</Tag>
          )}
        </p>
      ),
      responsive: ["sm"],
    },
    totalAmount: {
      sorter: (a: Order, b: Order) => a.totalAmount - b.totalAmount,
      sortDirections: ["descend"],
      responsive: ["sm"],
    },
    remark: {
      render: (text: string, record: Order) => (
        <Editable
          item={record}
          targetId={record.orderId}
          text={text}
          updateFunction={handleInputConfirm}
          handleRemarkChange={handleRemarkChange}
        />
      ),
      responsive: ["sm"],
    },
    actionXS: {
      render: (_: string, record: Order) => (
        <>
          <Space size="middle">
            <Button type="primary" onClick={() => confirm(record)}>
              確認收款
            </Button>
          </Space>
          <Space size="middle" className="my-2">
            <Button danger onClick={() => deleteOrder(record)}>
              刪除訂單
            </Button>
          </Space>
        </>
      ),
      width: 50,
      responsive: ["xs"],
    },
    action: {
      render: (_: string, record: Order) => (
        <>
          <Space size="middle">
            <Button type="primary" onClick={() => confirm(record)}>
              確認收款
            </Button>
          </Space>
          <Space size="middle" className="my-2">
            <Button danger onClick={() => deleteOrder(record)}>
              刪除訂單
            </Button>
          </Space>
        </>
      ),
      width: 110,
      responsive: ["sm"],
    },
  };

  const handleInputConfirm = (orderId: string, text: string) => {
    updateOrderData(
      {
        remark: text,
        orderId: orderId,
      },
      session
    );
  };

  const handleRemarkChange = (e: any, record: Order) => {
    const newOrderData = orderData.map((item) => {
      if (item.orderId === record.orderId) {
        return { ...item, remark: e.target.value };
      }
      return item;
    });
    setOrderData(newOrderData);
  };

  const columns = tableConfig(columnsRenderMap);

  const handleOnDelete = (record: Order) => {
    setLoading(true);
    fetch(`${domain}/api/cms/deleteOrder/${record.orderId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        secret: sha256(session.id + process.env.NEXT_PUBLIC_SALT),
      },
    })
      .then((res) => res.json())
      .then(() => {
        getOrderData();
        setLoading(false);
        return message.success("訂單已刪除");
      })
      .catch((err) => {
        setLoading(false);
        return message.error("訂單刪除失敗");
      });
  };

  const getOrderData = () => {
    fetch(`${domain}/api/cms/orderList`, {
      headers: {
        secret: sha256(session.id + process.env.NEXT_PUBLIC_SALT),
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setOrderData(data);
      });
  };

  const handleOnConfirm = (record: Order) => {
    setLoading(true);
    //remove _id
    record._id && delete record._id;
    updateOrderData(record, session)
      .then((res) => res.json())
      .then(() => {
        getOrderData();
        setLoading(false);
        return message.success("訂單已更新付款狀態");
      })
      .catch((err) => {
        setLoading(false);
        return message.error("訂單更新失敗");
      });
  };

  const confirm = (record: Order) => {
    modal.confirm({
      title: record.orderId + " 即將寄出付款確認信 ",
      icon: <ExclamationCircleOutlined />,
      content: record.paidAt ? "訂單已付款，將再次寄出" : "請確認對帳完成",
      okText: "確認",
      cancelText: "取消",
      onOk: () => handleOnConfirm(record),
    });
  };

  const deleteOrder = (record: Order) => {
    modal.confirm({
      title: record.orderId + " 即將刪除訂單 ",
      icon: <ExclamationCircleOutlined />,
      content: "刪除後將無法復原",
      okText: "確認",
      cancelText: "取消",
      onOk: () => handleOnDelete(record),
    });
  };

  return (
    <div className="container mx-auto my-24 text-slate-600">
      <h1 className="text-center text-2xl mb-10">訂單管理中心</h1>
      <div>
        {orderData.length !== 0 && (
          <Table dataSource={orderData} columns={columns} loading={loading} />
        )}
        {contextHolder}
      </div>
    </div>
  );
};

export default OrderList;
