import { setCookie } from "cookies-next";
import passport from "passport";

export default async function handler(req, res, next) {
  passport.authenticate("google", (err, user, info) => {
    console.log("err", err);
    console.log("info", info);
    console.log("user", user);
    if (err || !user) res.redirect("http://localhost:3000/?error=google");

    setCookie("token", info.token, { req, res });
    setCookie("userId", user.userId, { req, res });

    res.redirect("http://localhost:3000/");
  })(req, res, next);
}
