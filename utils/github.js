require('dotenv').config();
const axios = require('axios');
const { db, Users, Repos, Issues } = require('../database/database');
const queries = require('../utils/queries');
const gitHubAPI = 'https://api.github.com/graphql';

// Query github API v4(GraphQL)
const gitQuery = (token, query) => {
  const queryHeader = {
    headers: {
      Authorization: `bearer ${token}`,
    },
  };
  return axios.post(gitHubAPI, { query }, queryHeader);
};

// save assigned issues from github to db
const updateReposAndIssues = (token, user) => {
  let issuesRetrieved = [];
  let reposRetrieved = [];

  return new Promise((resolve, reject) => {
    gitQuery(token, queries.assignedIssues(user))
      .then(({ data }) => {
        issuesRetrieved = data.data.search.nodes.map((issue) => {
          return {
            git_id: issue.id,
            number: issue.number,
            title: issue.title,
            body: issue.body,
            username: user,
            reponame: issue.repository.name,
            complete: issue.state === 'OPEN' ? false : true,
          }
        });
        data.data.search.nodes.reduce((acc, issue) => {
          if (acc[issue.repository.name] === undefined) {
            acc[issue.repository.name] = 1;
            reposRetrieved.push({
              username: user,
              git_id: issue.repository.id,
              name: issue.repository.name,
              owner: issue.repository.owner.login
            });
          }
          return acc;
        }, {});
        // console.log('Issues:', issuesRetrieved);
        // console.log('Repos:', reposRetrieved);
        return Issues.bulkCreate(issuesRetrieved, {
          updateOnDuplicate: ["complete"]
        });
      })
      .then(() => {
        return Repos.bulkCreate(reposRetrieved, {
          updateOnDuplicate: []
        });
      })
      .then(() => resolve())
      .catch((err) => reject(err));
  });
};

module.exports.gitQuery = gitQuery;
module.exports.updateReposAndIssues = updateReposAndIssues;
