const express = require("express");
const app = express();
const axios = require("axios");
const PORT = 3000;
app.use(express.json());
require("dotenv").config();
const token = process.env.GitHub_Token;

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
        Authorization: `token ${token}`,
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
          Authorization: `token ${token}`,
        },
      }
    );

    languageStats.push({
      repoName: repoName,
      languages: response.data,
    });
  }
  const res = languageStats.reduce(
    (a, b) => {
      a.repositories.push(b.repoName);
      for (const lang of Object.keys(b.languages)) {
        if (a.languages.hasOwnProperty(lang)) {
          a.languages[lang] += b.languages[lang];
        } else {
          a.languages[lang] = b.languages[lang];
        }
      }
      return a;
    },
    { languages: {}, repositories: [] }
  );

  const totBytes = Object.values(res.languages).reduce((a, b) => a + b);

  for (const lang of Object.keys(res.languages)) {
    res.languages[lang] = res.languages[lang] / totBytes;
  }

  return res;
}
app.listen(PORT, () => {
  console.log(`API server listening at http://localhost:${PORT}`);
});
