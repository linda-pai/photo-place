import React, { useEffect } from "react";
import { Form, Input, Button, message, Modal } from "antd";
import { sha256 } from "js-sha256";

const NotifyForm = ({
  eventName,
  eventId,
}: {
  eventName: string;
  eventId: string;
}) => {
  const [form] = Form.useForm();
  const [modal, contextHolder] = Modal.useModal();
  const [submittable, setSubmittable] = React.useState(false);
  const values = Form.useWatch([], form);

  const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
  };

  const validateMessages = {
    required: "請填寫${label}",
    types: {
      email: "Email格式有誤",
    },
  };

  useEffect(() => {
    form.validateFields({ validateOnly: true }).then(
      () => {
        setSubmittable(true);
      },
      () => {
        setSubmittable(false);
      }
    );
  }, [values]);

  const onSubmit = async (values: any) => {
    const bib = values.bib || "";
    const notifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/events/${eventId}?bib=${bib}`;
    //fetch api
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/user/notifyRecord`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          notifyUrl,
          eventName,
          eventId,
          status: "pending",
        }),
      }
    ).then((res) => res.json());

    const { status, msg } = response;

    if (status === 200) {
      modal.info({
        title: msg,
        content: "我們將在上傳完成後通知您",
      });
      setTimeout(() => {
        form.resetFields();
      }, 1000);
      return;
    } else {
      return message.error("登記失敗");
    }
  };

  return (
    <div className="text-center text-[color:var(--main-color-dark)] my-10  px-4 flex flex-col justify-center  min-h-[60vh]">
      <div className="">
        <h3 className="mx-auto w-[240px] mb-10 sm:text-xl text-md text-[#faad14]">
          {eventName}
        </h3>
        <h3 className="sm:mb-3 mb-1 sm:text-xl text-md">尚未有照片上傳</h3>
        <h3 className="sm:mb-8 mb-1 sm:text-xl text-md">
          請留下您的號碼布，我們將在上傳完成後通知您
        </h3>
        <Form
          form={form}
          name="basic"
          onFinish={onSubmit}
          style={{ maxWidth: 600 }}
          className="mx-auto w-full"
          validateMessages={validateMessages}
          {...layout}
        >
          <Form.Item
            name="bib"
            label="號碼布號碼"
            rules={[
              {
                required: false,
                type: "string",
              },
              {
                pattern: /^[0-9]{0,6}$/,
                message: "最多6位數字",
              },
            ]}
          >
            <Input placeholder="請輸入您的號碼布" className="w-full" />
          </Form.Item>
          <Form.Item
            name="email"
            label="通知 Email"
            rules={[
              {
                required: true,
                type: "email",
              },
            ]}
          >
            <Input placeholder="請輸入您的Email" />
          </Form.Item>
          <Form.Item className="flex justify-center">
            <Button
              className="mt-8"
              type="primary"
              htmlType="submit"
              disabled={!submittable}
            >
              確認
            </Button>
          </Form.Item>
        </Form>
        {contextHolder}
      </div>
    </div>
  );
};

export default NotifyForm;
