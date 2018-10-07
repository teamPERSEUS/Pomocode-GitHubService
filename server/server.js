require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.listen(process.env.PORT || 4000, () => {
  console.log(`App listening on port: ${process.env.PORT}`);
});


