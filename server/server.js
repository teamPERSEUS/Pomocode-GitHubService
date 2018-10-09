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

// send out repo and issue data to app
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

app.listen(process.env.PORT, () => {
  console.log(`App listening on port: ${process.env.PORT}`);
});