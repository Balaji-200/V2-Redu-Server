const passport = require("passport");
const passportLocal = require("passport-local");
const Users = require("../models/user");
const jwt = require("jsonwebtoken");
const passportJwtStrategy = require("passport-jwt");
if(process.env.NODE_ENV == 'development')
  require("dotenv").config({ path: "./config.env" });

passport.use(new passportLocal.Strategy({ usernameField: 'email' },Users.authenticate()));

passport.serializeUser(Users.serializeUser());
passport.deserializeUser(Users.deserializeUser());

passport.use('resetPassword',
  new passportJwtStrategy.Strategy(
    {
      jwtFromRequest: passportJwtStrategy.ExtractJwt.fromUrlQueryParameter('token'),
      secretOrKey: process.env.resetSecret,
    },
    async (jwt_payload, done) => {
      Users.findOne({ email: jwt_payload.email }, (err, user) => {
        if (err) {
          done(err, false);
        }
        if (user) done(null, user);
        else {
          done(null, false);
        }
      });
    }
  )
);

passport.use('jwtHeader', new passportJwtStrategy.Strategy({
    jwtFromRequest: passportJwtStrategy.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRET
}, async (jwt_payload, done) => {
    Users.findOne({ _id : jwt_payload._id }, (err, user) =>{
        if (err) {
            done(err, false);
          }
          if (user) done(null, user);
          else {
            done(null, false);
          }
    })
}))

module.exports.verifyPasswordReset = passport.authenticate('resetPassword', { session: false });
module.exports.verifyUser = passport.authenticate('jwtHeader', { session: false });

module.exports.generateResetPasswordLink = (user) => {
  const token = jwt.sign(user, process.env.resetSecret, {
    expiresIn: "0.5h",
  });
  return `${process.env.FRONT_URL}/resetPassword?token=${token}`;
};

module.exports.getToken = (user) => {
  return jwt.sign(user, process.env.SECRET, {
    expiresIn: "10d",
  });
};
