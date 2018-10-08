require('dotenv').config();
const axios = require('axios');
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

module.exports.gitQuery = gitQuery;
