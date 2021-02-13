const router = require("express").Router();
const bodyParser = require("body-parser");
const authenticate = require("../src/authenticate");
const Demo = require("../models/demographic");

router.use(bodyParser.json());

router
  .route("/")
  .get(authenticate.verifyUser, (req, res, next) => {
    Demo.find({})
      .populate("user")
      .then(
        (data) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(data);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Demo.deleteMany({}).then((response) => {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json(response);
    });
  });

///////////////////////////////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

router
  .route("/response")
  .get(authenticate.verifyUser, (req, res, next) => {
    Demo.findOne({ user: req.user._id })
      .populate("user")
      .then(
        (data) => {
          if (data != null) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(data);
          } else {
            Demo.create({ user: req.user._id })
              .then(
                (dat) => {
                  dat.populate("user", (err, datas) => {
                    if (err) next(err);
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(datas);
                  });
                },
                (err) => next(err)
              )
              .catch((err) => next(err));
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    Demo.findOne({ user: req.user._id })
      .then(
        (data) => {
          if (data != null) {
            for (var i = 0; i < req.body.length; i++) {
              if (data.questions.indexOf(req.body[i]._id) == -1)
                data.questions.push(req.body[i]);
            }
            data.save().then((response) => {
              response.populate("user", (err, dat) => {
                if (err) next(err);
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(dat);
              });
            });
          } else {
            Demo.create({ user: req.user._id, questions: req.body })
              .then(
                (dat) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(dat);
                },
                (err) => next(err)
              )
              .catch((err) => next(err));
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Demo.deleteOne({ user: req.user._id }).then((response) => {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json(response);
    });
  });

///////////////////////////////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

router
  .route("/:userId")
  .get(authenticate.verifyUser, (req, res, next) => {
    Demo.findOne({ user: req.params.userId })
      .then(
        (response) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(response);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Demo.deleteOne({ user: req.params.userId })
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
module.exports = router;
