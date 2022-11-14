const express = require("express");
const app = express();
const axios = require("axios");
const PORT = 3000;
var cors = require("cors");
app.use(cors());
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
app.get("/test/test", (req, res) => {
  console.log("Hello World");
  res.send("Hello world");
});

async function getRepositoryNames(username) {
  return await axios
    .get(`https://api.github.com/users/${username}/repos`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
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
      return [];
    });
}

async function getRepositoryLanguages(owner, repos) {
  let languageStats = [];
  if (repos.length == 0) {
    return "No user with such username";
  } else {
    for (let index = 0; index < repos.length; index++) {
      const repoName = repos[index];

      const response = await axios.get(
        `https://api.github.com/repos/${owner}/${repoName}/languages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
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
      res.languages[lang] =
        ((res.languages[lang] / totBytes) * 100).toFixed(1) + "%";
    }

    return res;
  }
}
app.listen(PORT, () => {
  console.log(`API server listening at http://localhost:${PORT}`);
});
