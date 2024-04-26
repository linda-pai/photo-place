import Head from "next/head";
import { Table } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import usePermission from "@/hooks/usePermission";
import copyToClipboard from "@/utils/copyToClipboard";
import { UserProps } from "@/types/interfaces/UserProps";

const UserManagement = ({ userList }: { userList: UserProps[] }) => {
  const title = "用戶管理 - " + process.env.NEXT_PUBLIC_APP_NAME;
  const isAllowed = usePermission();

  const columns = [
    {
      title: "ID",
      dataIndex: "userId",
      key: "userId",
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
    },
    {
      title: "名稱",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "角色",
      dataIndex: "role",
      key: "role",
      sorter: (a: UserProps, b: UserProps) => a.role.localeCompare(b.role),
    },
    {
      title: "加入時間",
      dataIndex: "createTime",
      key: "createTime",
      render: (text: string) => {
        return text
          ? dayjs(text).format("YYYY-MM-DD HH:mm:ss")
          : "2023-12~2024-01";
      },
      sorter: (a: UserProps, b: UserProps) =>
        a.createTime === b.createTime ? 0 : a.createTime ? -1 : 1,
    },
  ];

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="用戶管理" />
        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_APP_URL}/cms/userManagement`}
        />
      </Head>

      {isAllowed ? (
        <div className="container mx-auto my-24 text-slate-600">
          <h1 className="text-center text-2xl mb-10">用戶管理</h1>
          <div className="w-full flex justify-end my-4 gap-1">
            共{userList.length}筆資料
          </div>
          <Table dataSource={userList} columns={columns} />
        </div>
      ) : (
        <div>
          <h1>Permission Denied</h1>
        </div>
      )}
    </>
  );
};
export default UserManagement;

export async function getServerSideProps() {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  // Fetch data from external API
  const userList = await fetch(`${domain}/api/user/userList`).then((res) =>
    res.json()
  );

  // Pass data to the page via props
  return { props: { userList } };
}
