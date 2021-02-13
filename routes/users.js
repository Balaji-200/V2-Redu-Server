const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const router = express.Router();
const Users = require("../models/user");
const mailer = require("../src/mail");
const authenticate = require("../src/authenticate");

router.use(bodyParser.json());
/* GET users listing. */
router
  .route("/")
  .get((req, res, next) => {
    Users.find({})
      .then(
        (user) => {
          if (user) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(user);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .delete((req, res, next) => {
    Users.deleteMany({})
      .then(
        (response) => {
          if (response) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(response);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

router.route("/:userId").delete(authenticate.verifyUser, (req, res, next) => {
  Users.deleteOne({ _id: req.params.userId })
    .then(
      (response) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(response);
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
});
router.route("/signup").post((req, res, next) => {
  Users.findOne({ username: req.body.username, email: req.body.email })
    .then(
      (user) => {
        if (user) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json({
            success: true,
            message: `An account with username ${user.username} already exists. Please Login!!`,
          });
        } else {
          Users.register(
            {
              username: req.body.username,
              email: req.body.email,
              nameOfInstitute: req.body.nameOfInstitute,
            },
            req.body.password,
            (err, user) => {
              if (err) next(err);
              else {
                mailer.sendConfirmationMail(req.body.email);
                passport.authenticate("local")(req, res, () => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json({
                    success: true,
                    message: `Account with username ${user.username} created. Please check your email to activate your account.`,
                  });
                });
              }
            }
          );
        }
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.json({
        success: false,
        message: "Email or password is incorrect",
      });
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      const token = authenticate.getToken({ _id: user._id });
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json({
        success: true,
        message: "Successfully logged in.",
        token: token,
      });
    });
  })(req, res, next);
});

router
  .route("/resetPassword")
  .get(authenticate.verifyPasswordReset, (req, res, next) => {
    if (req.user) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json({ success: true, username: req.user.username });
    }
  })
  .post((req, res, next) => {
    Users.findOne({ email: req.body.email })
      .then(
        (user) => {
          if (user) {
            mailer.sendResetPasswordMail(user.email);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json({
              success: true,
              message:
                "An email has been sent with the reset link, Please check your mail.",
            });
          } else {
            res.statusCode = 409;
            res.setHeader("Content-Type", "application/json");
            res.json({
              success: false,
              message:
                "Email is invalid or User with this email address doesn't exist. ",
            });
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

router.post("/resetPassword/reset", (req, res, next) => {
  Users.findOne({ username: req.body.username }).then(async (user) => {
    if (user) {
      await user.setPassword(req.body.password);
      await user.save().then((info) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json({
          success: true,
          message:
            "Successfully Changed password, Please Login with the new password.",
        });
      });
    } else {
      res.statusCode = 501;
      res.setHeader("Content-Type", "application/json");
      res.json({
        success: false,
        message: "Something went Wrong, Please try again.",
      });
    }
  });
});

router.get("/dashboard", authenticate.verifyUser, (req, res, next) => {
  if (req.user) {
    req.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.json({ user: req.user });
  }
});

router.get("/logout", authenticate.verifyUser, (req, res, next) => {
  if (req.user) {
    req.logOut();
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.json({ success: true, message: "Successfully Logged Out." });
  }
});
module.exports = router;

// SingUp //

// {
//   "username": "Balaji",
//   "email": "bala@bala.com",
//   "nameOfInstitute": "IDK",
//   "password": "12Password"
// }
