import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { message } from "antd";

function userPermission(): boolean {
  const [isAllowed, setIsAllowed] = useState(false);
  const router = useRouter();

  const permissionByPage: { [key: string]: any[] } = {
    "/cms/orderList": [process.env.NEXT_PUBLIC_ADMIN_ID],
    "/upload": [process.env.NEXT_PUBLIC_ADMIN_ID],
    "/createEvent": [process.env.NEXT_PUBLIC_ADMIN_ID],
  };

  useEffect(() => {
    const userId = getCookie("userId");

    const allowedRoles = permissionByPage[router.pathname];
    if (allowedRoles.includes(userId)) {
      setIsAllowed(true);
    } else {
      setIsAllowed(false);
      message.error("You are not allowed to access this page");
      router.back();
    }

    if (userId) {
      setIsAllowed(true);
    }
  }, [router.pathname]);

  return isAllowed;
}

export default userPermission;
