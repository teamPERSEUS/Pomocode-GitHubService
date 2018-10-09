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

// retrieve user after login. obtain issues and store
app.post('/login', (req, res) => {
  // obtain username
  gitQuery(req.body.token, Queries.login)
    .then(({ data }) => {
      User.findOrCreate({ where: { name: data.data.viewer.login } })
        // .then(() => {
        //   // save issues from github to db
        //   return updateReposAndIssues(req.body.token, data.data.viewer.login)
        // })
        .then(() => {
          res.send(data.data.viewer);
        })
        .catch((err) => {
          console.log("Error in saving in DB:", err);
          res.status(500).send("Error in Login");
          throw (err);
        });
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
})

// query github API v4(GraphQL)
app.post('/query', (req, res) => {
  let query = Queries[req.body.query];
  if (typeof query === 'function') {
    query = Queries[req.body.query](req.body.user)
  }
  gitQuery(req.body.token, query)
    .then(({ data }) => {
      res.send(data.data);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.listen(process.env.PORT, () => {
  console.log(`App listening on port: ${process.env.PORT}`);
});