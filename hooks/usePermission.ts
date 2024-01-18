//檢查是否有admin權限

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { message } from "antd";

function usePermission(): boolean {
  const [isAllowed, setIsAllowed] = useState(false);
  const router = useRouter();
  const { data: session }: any = useSession();

  const permissionByPage: { [key: string]: any[] } = {
    "/cms/orderList": [process.env.NEXT_PUBLIC_ADMIN_ID],
    "/upload": [process.env.NEXT_PUBLIC_ADMIN_ID],
    "/createEvent": [process.env.NEXT_PUBLIC_ADMIN_ID],
    "/uploadImagePage": [process.env.NEXT_PUBLIC_ADMIN_ID],
  };

  useEffect(() => {
    const userId = session?.id;
    const allowedRoles = permissionByPage[router.pathname];

    console.log("userId", userId);
    if (session !== undefined) {
      if (allowedRoles?.includes(userId)) {
        setIsAllowed(true);
      } else {
        setIsAllowed(false);
        message.error("You are not allowed to access this page");
        router.back();
      }
    }
  }, [session]);

  return isAllowed;
}

export default usePermission;
