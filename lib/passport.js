import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import "../lib/passport";

console.log("lib - passport.js fired");

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/api/google/callback",
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
        };
        //登入成功後，將資料存入資料庫
        await fetch("http://localhost:3001/user/createUser", {
          method: "POST",
          body: JSON.stringify(user),
          headers: { "Content-Type": "application/json" },
        })
          .then((res) => res.json())
          .then((data) => {
            console.log(data);
          });

        done(null, user, { message: "Auth successful", token });
      } catch (err) {
        console.log(err);
        done(err, false, { message: "Something went wrong" });
      }
    }
  )
);
