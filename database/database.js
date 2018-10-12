const Sequelize = require('sequelize');
var db = new Sequelize('pomo_gitservice', 'root', '', {
  host: 'localhost',
  dialect: 'mysql'
});

// NOTE: Create DB 'pomo_gitservice' in mysql before running
db.authenticate()
  .then(() => {
    console.log('Connection has been established successfully')
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

/* DB --SCHEMA-- */
// Users table
const User = db.define('user', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: Sequelize.STRING,
    unique: true,
  }
});

// Repos table
const Repos = db.define('repos', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  git_id: {
    type: Sequelize.STRING,
    unique: true,
  },
  username: Sequelize.STRING,
  name: Sequelize.STRING,
  owner: Sequelize.STRING,
});

// Issues table
const Issues = db.define('issues', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  git_id: {
    type: Sequelize.STRING,
    unique: true,
  },
  username: Sequelize.STRING,
  reponame: Sequelize.STRING,
  organization: Sequelize.STRING,
  number: Sequelize.INTEGER,
  title: Sequelize.STRING,
  body: Sequelize.TEXT('long'),
  complete: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  planned: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  estimate_start_date: Sequelize.DATEONLY,
  estimate_end_date: Sequelize.DATEONLY,
  estimate_time: Sequelize.FLOAT,
  time_remaining: Sequelize.FLOAT,
  startdate: Sequelize.DATEONLY,
  enddate: Sequelize.DATEONLY
});

// create/connect to tables in the db
db.sync();

module.exports.db = db;
module.exports.User = User;
module.exports.Repos = Repos;
module.exports.Issues = Issues;