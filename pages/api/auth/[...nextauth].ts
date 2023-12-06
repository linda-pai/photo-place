import NextAuth from "next-auth";
import type { NextApiRequest, NextApiResponse } from "next";
import GoogleProvider from "next-auth/providers/google";
import LineProvider from "next-auth/providers/line";

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
    secret: process.env.NEXT_PUBLIC_JWT_SECRET,
    pages: {
      signIn: "/auth/signIn",
    },

    callbacks: {
      async session({ session, token }: any) {
        session.id = token.id;
        const user = {
          email: session.user.email,
          name: session.user.name,
          token: token.id,
          userId: session.user.id,
        };

        //登入成功後，將資料存入資料庫
        await fetch(`${domain}/api/user/createUser`, {
          method: "POST",
          body: JSON.stringify(user),
          headers: { "Content-Type": "application/json" },
        })
          .then((res) => res.json())
          .catch((err) => console.log(err));

        return session;
      },
      async jwt({ token, user }) {
        if (user) token.id = user.id.toString();
        return token;
      },
    },
  });
}
