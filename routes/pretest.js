const router = require("express").Router();
const bodyParser = require("body-parser");
const authenticate = require("../src/authenticate");
const Pretest = require("../models/preTest");

function calculateTotal(data){
  let total = 0;
  data.forEach(el => {
    if(el.answer == el.correctAnswer) 
      total++
  });
  return total;
}


router.use(bodyParser.json());

router.route("/").get(authenticate.verifyUser, (req, res, next) => {
  Pretest.find({}).populate("user")
    .then(
      (pretest) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(pretest);
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
}).delete(authenticate.verifyUser, (req, res, next) => {
  Pretest.deleteMany({}).then(response => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(response);
  })
})

///////////////////////////////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

router
  .route("/response")
  .get(authenticate.verifyUser, (req, res, next) => {
    Pretest.findOne({ user: req.user._id })
      .populate("user")
      .then(
        (pretest) => {
          if (pretest != null) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(pretest);
          } else {
            Pretest.create({ user: req.user._id })
              .then(
                (pre) => {
                  pre.populate("user", (err, pres) => {
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
    Pretest.findOne({ user: req.user._id })
      .then(
        (pretest) => {
          if (pretest != null) {
            for (var i = 0; i < req.body.length; i++) {
              if (pretest.questions.indexOf(req.body[i]._id) == -1)
                pretest.questions.push(req.body[i]);
            }
            pretest.score = calculateTotal(req.body);
            pretest.save().then((response) => {
              response.populate("user", (err, pre) => {
                if (err) next(err);
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(pre);
              });
            });
          } else {
            Pretest.create({ user: req.user._id, questions: req.body })
              .then(
                (pre) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(pre);
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
    Pretest.deleteOne({ user: req.user._id }).then((response) => {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json(response);
    });
  });

///////////////////////////////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

router
  .route("/:userId")
  .get(authenticate.verifyUser, (req, res, next) => {
    Pretest.findOne({ user: req.params.userId })
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
    Pretest.deleteOne({ user: req.params.userId })
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
