const axios = require('axios');
const { Repos, Issues } = require('../database/database');
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

// save assigned issues/repos from github to db
const updateReposAndIssues = (token, user) => {
  let issuesRetrieved = [];
  let reposRetrieved = [];

  return new Promise((resolve, reject) => {
    gitQuery(token, queries.assignedIssues(user))
      .then(({ data }) => {

        // get assigned issues to user
        issuesRetrieved = data.data.search.nodes.map((issue) => {
          return {
            git_id: issue.id,
            number: issue.number,
            title: issue.title,
            body: issue.body,
            username: user,
            repo_url: issue.repository.url,
            reponame: issue.repository.name,
            organization: issue.repository.owner.login,
            complete: issue.state === 'OPEN' ? false : true,
          }
        });

        // get repos that have assigned issues to user
        data.data.search.nodes.reduce((acc, issue) => {
          if (acc[issue.repository.name] === undefined) {
            acc[issue.repository.name] = 1;
            reposRetrieved.push({
              username: user,
              git_id: issue.repository.id,
              name: issue.repository.name,
              owner: issue.repository.owner.login,
              url: issue.repository.url,
            });
          }
          return acc;
        }, {});

        // store/update assignedIssues in db
        // return Issues.bulkCreate(issuesRetrieved, {
        //   updateOnDuplicate: ["title", "body", "reponame", "complete"]
        // });
        // return Promise.all(issuesRetrieved.map(async (issue) => {
        //   return await Issues.upsert(issue);
        // }));
        async function storeIssues(upsertIssues) {
          for (const issue of upsertIssues) {
            await Issues.upsert(issue);
          }
        }
        return storeIssues(issuesRetrieved);
      })
      .then(() => {
        // store/update repos with issues assigned to user in db
        // return Repos.bulkCreate(reposRetrieved, {
        //   updateOnDuplicate: ["name", "owner"]
        // });
        // return Promise.all(reposRetrieved.map(async (repo) => {
        //   return await Repos.upsert(repo);
        // }));
        async function storeRepos(upsertRepos) {
          for (const repo of upsertRepos) {
            await Repos.upsert(repo);
          }
        }
        return storeRepos(reposRetrieved);
      })
      .then(() => resolve())
      .catch((err) => reject(err));
  });
};

module.exports.gitQuery = gitQuery;
module.exports.updateReposAndIssues = updateReposAndIssues;
