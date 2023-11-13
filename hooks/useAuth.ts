import { useEffect } from "react";
import { useRouter } from "next/router";
import { getCookie } from "cookies-next";

const useAuth = () => {
  const router = useRouter();
  const isAuthenticated = Boolean(getCookie("token"));
  console.log("router", router);
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  return isAuthenticated;
};

export default useAuth;
