const express = require("express");
const app = express();
const axios = require("axios");
const PORT = 3000;
app.use(express.json());

// routes
app.get("/:name", (req, res) => {
  getRepositoryNames(req.params.name).then((repositories) => {
    getRepositoryLanguages(req.params.name, repositories).then(
      (languageStats) => {
        res.send(languageStats);
      }
    );
  });
});

function getRepositoryNames(username) {
  return axios
    .get(`https://api.github.com/users/${username}/repos`, {
      headers: {
        Authorization: "token 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",
      },
    })
    .then((response) => {
      return response.data
        .map((repo) => ({
          name: repo.name,
        }))
        .map((e) => e.name);
    })
    .catch((error) => {
      console.log(error);
      return Promise.reject(error);
    });
}

async function getRepositoryLanguages(owner, repos) {
  let languageStats = [];

  for (let index = 0; index < repos.length; index++) {
    const repoName = repos[index];

    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repoName}/languages`,
      {
        headers: {
          Authorization: "token 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",
        },
      }
    );

    languageStats.push({
      repoName: repoName,
      languages: response.data,
    });
  }
  languageStats.push({
    publicRepositories: repos,
  });

  return languageStats;
}
app.listen(PORT, () => {
  console.log(`API server listening at http://localhost:${PORT}`);
});
