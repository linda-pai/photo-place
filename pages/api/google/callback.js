import { setCookie } from "cookies-next";
import passport from "passport";

export default async function handler(req, res, next) {
  const appURL = process.env.NEXT_PUBLIC_APP_URL;
  passport.authenticate("google", (err, user, info) => {
    console.log("err", err);
    console.log("info", info);
    console.log("user", user);
    if (err || !user) res.redirect(`${appURL}/?error=google`);

    setCookie("token", info.token, { req, res });
    setCookie("userId", user.userId, { req, res });

    res.redirect(`${appURL}`);
  })(req, res, next);
}
