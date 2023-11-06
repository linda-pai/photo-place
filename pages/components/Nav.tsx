import { useRouter } from "next/router";
import { deleteCookie } from "cookies-next";
import jwt from "jsonwebtoken";

const Nav = ({ userInfo }: any) => {
  const { name, email } = userInfo;
  const router = useRouter();
  const logout = async () => {
    deleteCookie("token");
    router.push("/");
  };
  return (
    <div className=" bg-gray-100 p-5">
      <div>welcome</div>
      <div>{name}</div>
      <div>{email}</div>

      <div>
        <button onClick={logout}>登出</button>
      </div>
    </div>
  );
};

export async function getServerSideProps(context: any) {
  // Fetch data from external API
  const { token } = context.req.cookies;

  console.log("token", token);
  if (!token) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const verifiedToken = await jwt.verify(
    token,
    process.env.NEXT_PUBLIC_JWT_SECRET
  );
  console.log("verifiedToken", verifiedToken);

  const resUser = await fetch(
    `http://localhost:3001/user/getUserInfo/${token}`
  ).then((res) => res.json());

  // Pass data to the page via props
  return { props: { userInfo: resUser[0] } };
}

export default Nav;
