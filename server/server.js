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
  res.header('Access-Control-Allow-Origin', `http://localhost:8080`);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', '*');
  next();
});

// query github API v4(GraphQL)
app.post('/query', (req, res) => {
  gitQuery(req.body.token, Queries[req.body.query])
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


