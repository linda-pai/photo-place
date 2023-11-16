import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import "../lib/passport";

console.log("lib - passport.js fired");
const appURL = process.env.NEXT_PUBLIC_APP_URL;
const domain = process.env.NEXT_PUBLIC_SERVER_URL;

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
      callbackURL: `${appURL}/api/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      // passport callback function
      console.log("passport callback function fired");
      console.log(profile);

      try {
        const token = await jwt.sign(
          { id: profile.id, createdAt: Date.now().toString() },
          process.env.NEXT_PUBLIC_JWT_SECRET
        );

        const user = {
          email: profile.emails[0].value,
          name: profile.displayName,
          accessToken,
          token,
          userId: profile.id,
        };
        //登入成功後，將資料存入資料庫
        await fetch(`${domain}/user/createUser`, {
          method: "POST",
          body: JSON.stringify(user),
          headers: { "Content-Type": "application/json" },
        })
          .then((res) => res.json())
          .then((data) => console.log(data));

        done(null, user, { message: "Auth successful", token });
      } catch (err) {
        console.log(err);
        done(err, false, { message: "Something went wrong" });
      }
    }
  )
);
