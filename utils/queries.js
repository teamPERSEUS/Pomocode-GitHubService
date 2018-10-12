const login = `query {
  viewer {
    login
  }
}`;

const assignedIssues = user => `query {
  search(query:"assignee:${user} is:issue",type:ISSUE,last:100) {
    issueCount
    nodes {
      ... on Issue {
        id
        number
        state
        title
        body
        repository {
          id
          name
          url
          owner {
            login
          }
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}`;

module.exports.login = login;
module.exports.assignedIssues = assignedIssues;