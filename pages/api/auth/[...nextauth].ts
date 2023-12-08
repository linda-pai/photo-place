import NextAuth from "next-auth";
import type { NextApiRequest, NextApiResponse } from "next";
import GoogleProvider from "next-auth/providers/google";
import LineProvider from "next-auth/providers/line";
import { message } from "antd";

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  const domain = process.env.NEXT_PUBLIC_SERVER_URL;
  const providers = [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET as string,
    }),
    LineProvider({
      clientId: process.env.NEXT_PUBLIC_LINE_CHANNEL_ID as string,
      clientSecret: process.env.NEXT_PUBLIC_LINE_CHANNEL_SECRET as string,
    }),
  ];

  return await NextAuth(req, res, {
    providers,
    secret: process.env.NEXT_PUBLIC_NEXTAUTH_SECRET,
    pages: {
      signIn: "/auth/signIn",
    },
    callbacks: {
      async session({ session, token }: any) {
        session.id = token.id;
        console.log("session", session);
        console.log("token", token);
        const user = {
          email: session.user.email,
          name: session.user.name,
          token: token.jti,
          userId: token.id,
        };
        //登入成功後，將資料存入資料庫
        await fetch(`${domain}/api/user/createUser`, {
          method: "POST",
          body: JSON.stringify(user),
          headers: { "Content-Type": "application/json" },
        })
          .then((res) => res.json())
          .catch((err) => message.error("登入失敗，請重新登入"));

        return session;
      },
    },
  });
}
