import { Button } from "antd";
import Link from "next/link";
import "../lib/passport";

const LoginPage = () => {
  return (
    <div className="container mx-auto">
      <div className="flex justify-center items-center">loginPage</div>
      <Link href="http://localhost:3000/api/google">
        <Button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded h-fit">
          Login with Google
        </Button>
      </Link>
    </div>
  );
};

export default LoginPage;
