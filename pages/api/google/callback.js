import { setCookie } from "cookies-next";
import passport from "passport";

export default async function handler(req, res, next) {
  const appURL = process.env.NEXT_PUBLIC_APP_URL;
  return new Promise((resolve, reject) => {
    passport.authenticate("google", (err, user, info) => {
      if (err || !user) res.redirect(`${appURL}/?error=google`);

      setCookie("token", info.token, { req, res });
      setCookie("userId", user.userId, { req, res });

      res.writeHead(302, {
        Location: `${appURL}`,
      });
      res.end();
      resolve();
    })(req, res, next);
  });
}
