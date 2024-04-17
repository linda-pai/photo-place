//檢查是否有admin權限

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { message } from "antd";
import useAuth from "@/hooks/useAuth";
import { ROLE_PHOTOGRAPHER, ROLE_ADMIN } from "@/lib/roles";

function usePermission(): boolean {
  const isLogin = useAuth();

  const [isAllowed, setIsAllowed] = useState(false);
  const router = useRouter();
  const { data: session }: any = useSession();

  // path底下的路徑都需要的權限
  const permissionByPath: any = [
    {
      path: "/cms",
      allowedRoles: ROLE_ADMIN,
    },
    {
      path: "/uploadService",
      allowedRoles: ROLE_PHOTOGRAPHER,
    },
    {
      path: "/createEvent",
      allowedRoles: ROLE_ADMIN,
    },
    {
      path: "/uploadImagePage",
      allowedRoles: ROLE_ADMIN,
    },
    {
      path: "/photographer",
      allowedRoles: ROLE_PHOTOGRAPHER,
    },
  ];

  useEffect(() => {
    if (!isLogin) return;
    const userId = session?.id;
    const allowedRoles = permissionByPath.find((item: any) =>
      router.pathname.includes(item.path)
    )?.allowedRoles;

    if (session !== undefined) {
      if (allowedRoles?.includes(userId)) {
        setIsAllowed(true);
      } else {
        setIsAllowed(false);
        message.error("You are not allowed to access this page");
        router.push("/");
      }
    }
  }, [session]);

  return isAllowed;
}

export default usePermission;
