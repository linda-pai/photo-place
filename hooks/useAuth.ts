import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

//TODO: 是否需要加入權限判斷
const useAuth = () => {
  const { data: session } = useSession();
  const router = useRouter();
  useEffect(() => {
    const previousUrl = router.asPath;
    if (session !== undefined && !session) {
      router.push(`/auth/signIn?previousUrl=${previousUrl}`);
    }
  }, [session, router]);

  return session;
};

export default useAuth;
