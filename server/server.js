require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const Queries = require('../utils/queries');
const { gitQuery, updateReposAndIssues } = require('../utils/github');
const { User, Issues, Repos } = require('../database/database');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', '*');
  next();
});

// retrieve/store user after login.
app.post('/login', (req, res) => {
  gitQuery(req.body.token, Queries.login)
    .then(({ data }) => {
      User.findOrCreate({ where: { name: data.data.viewer.login } })
        .spread((userResult, created) => {
          if (created) {
            console.log("New User:", userResult.dataValues.name);
          }
          res.send(data.data.viewer);
        });
    })
    .catch((err) => {
      console.log("Error in saving in DB:", err);
      res.status(500).send("Error in Login");
      throw (err);
    });
});

// obtain github data, store it and send to app
app.post('/refreshGitData', (req, res) => {
  const dbData = {};
  updateReposAndIssues(req.body.token, req.body.user)
    .then(() => {
      return Issues.findAll({
        attributes: { exclude: ['id'] },
        where: { username: req.body.user },
      });
    })
    .then((dbIssues) => {
      dbData.issues = dbIssues;
      return Repos.findAll({
        attributes: { exclude: ['id'] },
        where: { username: req.body.user },
      });
    })
    .then((dbRepos) => {
      dbData.repos = dbRepos;
      res.send(dbData);
    })
    .catch((err) => {
      console.log("Error with DB:", err);
      res.status(500).send("Error in obtaining Repo/Issue Data");
      throw (err);
    });
});

// update issue, set as planned
app.put('/addIssuePlan', (req, res) => {
  var username = req.body.user;
  var git_id = req.body.git_id;
  var estimate_time = (req.body.hrs * 60 * 60) + (req.body.minutes * 60);
  var estimate_start_date = req.body.startdate;
  var estimate_end_date = req.body.enddate;

  Issues.update({
    estimate_time: estimate_time,
    estimate_start_date: estimate_start_date,
    estimate_end_date: estimate_end_date,
  },
    {
      where: {
        git_id: git_id,
        username: username,
      }
    })
    .then(() => {
      res.send();
    })
    .catch((err) => {
      console.log(`User ${req.body.user}. Error in adding issue to plan:`, err);
      res.status(500).send("Error in adding issue to plan.");
    });
});


// send planned issues to the app
app.get('/getPlannedIssues', (req, res) => {
  user = req.query.user;
  Issues.findAll({
    where: {
      username: user,
      complete: false,
      planned: true,
    }
  })
    .then((plannedIssues) => {
      res.send(plannedIssues);
    })
    .catch((err) => {
      console.log(`User: ${user}. Error in obtaining planned issues:`, err);
      res.status(500).send("Error in obtaining planned Issues.");
    })
});

app.listen(process.env.PORT, () => {
  console.log(`App listening on port: ${process.env.PORT}`);
});