import { useEffect } from "react";
import { useRouter } from "next/router";
import { getCookie } from "cookies-next";

//TODO: 是否需要加入權限判斷
const useAuth = () => {
  const router = useRouter();
  const isAuthenticated = Boolean(getCookie("token"));
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  return isAuthenticated;
};

export default useAuth;
