const router = require("express").Router();
const bodyParser = require("body-parser");
const authenticate = require("../src/authenticate");
const PostTest = require("../models/posttest");

function calculateTotal(data){
  let total = 0;
  data.forEach(el => {
    if(el.answer == el.correctAnswer) 
      total++
  });
  return total;
}

router.use(bodyParser.json());

router
  .route("/")
  .get(authenticate.verifyUser, (req, res, next) => {
    PostTest.find({})
      .populate("user")
      .then(
        (posttest) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(posttest);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    PostTest.deleteMany({}).then((response) => {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json(response);
    });
  });

///////////////////////////////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

router
  .route("/response")
  .get(authenticate.verifyUser, (req, res, next) => {
    PostTest.findOne({ user: req.user._id })
      .populate("user")
      .then(
        (posttest) => {
          if (posttest != null) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(posttest);
          } else {
            PostTest.create({ user: req.user._id })
              .then(
                (pos) => {
                  pos.populate("user", (err, pres) => {
                    if (err) next(err);
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(pres);
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
    PostTest.findOne({ user: req.user._id })
      .then(
        (posttest) => {
          if (posttest != null) {
            for (var i = 0; i < req.body.length; i++) {
              if (posttest.questions.indexOf(req.body[i]._id) == -1)
                posttest.questions.push(req.body[i]);
            }
            posttest.score = calculateTotal(req.body);
            posttest.save().then((response) => {
              response.populate("user", (err, pos) => {
                if (err) next(err);
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(pos);
              });
            });
          } else {
            PostTest.create({ user: req.user._id, questions: req.body })
              .then(
                (pos) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(pos);
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
    PostTest.deleteOne({ user: req.user._id }).then((response) => {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json(response);
    });
  });

router
  .route("/response/setDate")
  .post(authenticate.verifyUser, (req, res, next) => {
    PostTest.findOne({ user: req.user._id })
      .then(
        (posttest) => {
          let date = new Date().getDate() + 7;
          let setDate = new Date();
          setDate.setDate(date);
          posttest.testDate = setDate.toISOString();
          posttest.save().then(
            (pos) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(pos);
            },
            (err) => next(err)
          );
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });
///////////////////////////////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

router
  .route("/:userId")
  .get(authenticate.verifyUser, (req, res, next) => {
    PostTest.findOne({ user: req.params.userId })
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
    PostTest.deleteOne({ user: req.params.userId })
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

