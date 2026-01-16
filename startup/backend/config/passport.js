const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
require("dotenv").config();



passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.GOOGLE_CALLBACK_URL}/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const name = profile.displayName;
        const googleId = profile.id;

        // ✅ STEP 1: FIND USER BY EMAIL (MOST IMPORTANT)
        let user = await User.findOne({ email });

        // ✅ STEP 2: IF USER EXISTS
        if (user) {
          // Attach googleId if not present
          if (!user.googleId) {
            user.googleId = googleId;
            user.provider = "google";
            user.isVerified = true;
            await user.save();
          }

          user.isNewSignup = false;
          return done(null, user);
        }

        // ✅ STEP 3: CREATE USER ONLY IF EMAIL DOES NOT EXIST
        user = await User.create({
          name,
          email,
          googleId,
          provider: "google",
          isVerified: true, // Google emails are verified
        });

        user.isNewSignup = true;
        return done(null, user);
      } catch (err) {
        console.error("Google Strategy Error:", err);
        return done(err, null);
      }
    }
  )
);

// ✅ Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// ✅ Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
