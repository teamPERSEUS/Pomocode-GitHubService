require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { gitQuery } = require('../utils/github');
const Queries = require('../utils/queries');

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

app.post('/login', (req, res) => {
  gitQuery(req.body.token, Queries.login)
    .then(({ data }) => {
      res.send(data.data.viewer);
    });
});

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


