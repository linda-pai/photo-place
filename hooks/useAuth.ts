//檢查是否登入，若未登入則導向登入頁面

import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

const useAuth = () => {
  const { data: session } = useSession();
  const router = useRouter();
  useEffect(() => {
    const previousUrl = router.asPath;
    if (session !== undefined && !session) {
      router.push(
        `${process.env.NEXT_PUBLIC_APP_URL}/auth/signIn?previousUrl=${previousUrl}`
      );
    }
  }, [session, router]);

  return session;
};

export default useAuth;
