import { setCookie } from "cookies-next";
import passport from "passport";

export default async function handler(req, res, next) {
  const appURL = process.env.NEXT_PUBLIC_APP_URL;
  return new Promise((resolve, reject) => {
    passport.authenticate("google", (err, user, info) => {
      console.log("err", err);
      console.log("user", user);
      console.log("info", info);
      if (err || !user) res.redirect(`${appURL}/?error=google`);

      if (info.token)
        setCookie("token", info.token, {
          req,
          res,
          maxAge: 60 * 60 * 24 * 7, // 1 week
          secure: true,
          sameSite: "strict",
        });
      if (user.userId)
        setCookie("userId", user.userId, {
          req,
          res,
          maxAge: 60 * 60 * 24 * 7, // 1 week
          secure: true,
          sameSite: "strict",
        });

      res.writeHead(302, {
        Location: `${appURL}`,
      });
      res.end();
      resolve();
    })(req, res, next);
  });
}
