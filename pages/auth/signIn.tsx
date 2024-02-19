import Link from "next/link";
import { getProviders, signIn } from "next-auth/react";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";

const SignInPage = ({
  providers,
  previousUrl,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const buttonStyle = {
    google: {
      style: "bg-[#4285f4]",
      icon: "/google-icon.svg",
    },
    line: {
      style: "bg-[#06c755]",
      icon: "/line-icon.svg",
    },
  };

  return (
    <div className="container mx-auto py-10 h-screen">
      <div className="flex flex-col h-[90%] w-fit mx-auto justify-center">
        <div className="p-8 m-4 border rounded-lg min-w-[280px] max-w-[365px]">
          <h3 className="pb-2 border-b w-[50%] text-center mx-auto text-[color:var(--main-color-dark)]">
            登入方式
          </h3>
          {Object.values(providers).map((provider) => (
            <div key={provider.name} className="flex justify-center my-5">
              <button
                onClick={() =>
                  signIn(provider.id, {
                    callbackUrl: Array.isArray(previousUrl)
                      ? previousUrl[0]
                      : previousUrl,
                  })
                }
                className=""
              >
                <div
                  className={`${
                    buttonStyle[provider.id as keyof typeof buttonStyle].style
                  } flex  rounded-[2px] shadow-lg hover:shadow-xl cursor-pointer text-white w-[240px] h-[42px]`}
                >
                  <div className="bg-white w-[40px] h-[40px] rounded-[2px] absolute mt-[1px] ml-[1px]">
                    <img
                      className="absoltue mt-[11px] ml-[11px] w-[18px] h-[18px]"
                      src={
                        buttonStyle[provider.id as keyof typeof buttonStyle]
                          .icon
                      }
                      alt="login-icon"
                    />
                  </div>
                  <p className="w-[240px] flex items-center justify-center ml-[40px] text-[14px]">
                    <b>透過 {provider.name} 帳戶繼續操作</b>
                  </p>
                </div>
              </button>
            </div>
          ))}

          <div className="text-xs text-[#857e85] leading-5">
            <p>
              若繼續操作，即表示你同意 Photo Pacer 攝影小隊{" "}
              <Link href="/policies/terms-of-use" className="text-[#4285f4]">
                使用者條款
              </Link>
              。請參閱我們的
              <Link href="/policies/privacy-policy" className="text-[#4285f4]">
                隱私權政策
              </Link>
              。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const providers = await getProviders();
  const previousUrl = context.query.previousUrl || "/";

  return { props: { providers: providers ?? [], previousUrl: previousUrl } };
}
