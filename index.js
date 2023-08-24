const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const token = process.env.GITHUB_TOKEN;

app.use(cors());
app.use(express.json());

app.get("/favicon.ico", (req, res) => {
  res.status(204).end();
});

app.get("/:name", getUserLanguageStats);

// Cached response storage
const cachedResponses = new Map();

async function getUserLanguageStats(req, res) {
  const username = req.params.name;
  try {
    const repositories = await getRepositoryNames(username);
    if (!repositories.length) {
      return res.send("There is no user with such name!");
    }

    const cachedStats = cachedResponses.get(username);
    if (cachedStats) {
      return res.send(cachedStats);
    }

    const languageStats = await getLanguageStatsForRepositories(username, repositories);
    if (Object.keys(languageStats.languages).length === 0) {
      return res.send("This user has empty repositories!");
    }

    calculateLanguagePercentages(languageStats);
    
    cachedResponses.set(username, languageStats); // Cache the response

    res.send(languageStats);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred.");
  }
}

async function getRepositoryNames(username) {
  try {
    const response = await axios.get(`https://api.github.com/users/${username}/repos`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data.map(repo => repo.name);
  } catch (error) {
    return [];
  }
}

async function getLanguageStatsForRepositories(owner, repos) {
  const languageStats = {
    languages: {},
    totalBytes: 0,
  };

  const requests = repos.map(async repoName => {
    try {
      const response = await axios.get(`https://api.github.com/repos/${owner}/${repoName}/languages`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      updateLanguageStats(languageStats, response.data);
    } catch (error) {
      console.error(`Error fetching languages for ${owner}/${repoName}:`, error);
    }
  });

  await Promise.all(requests);

  return languageStats;
}

function updateLanguageStats(languageStats, data) {
  for (const lang of Object.keys(data)) {
    languageStats.languages[lang] = (languageStats.languages[lang] || 0) + data[lang];
    languageStats.totalBytes += data[lang];
  }
}

function calculateLanguagePercentages(languageStats) {
  const totalBytes = languageStats.totalBytes;

  const filteredLanguages = {};
  for (const lang of Object.keys(languageStats.languages)) {
    const percentage = (languageStats.languages[lang] / totalBytes) * 100;
    if (percentage > 1) {
      filteredLanguages[lang] = percentage.toFixed(1) + "%";
    }
  }

  const sortedLanguages = Object.keys(filteredLanguages).sort((a, b) => {
    const percentageA = parseFloat(filteredLanguages[a]);
    const percentageB = parseFloat(filteredLanguages[b]);
    return percentageB - percentageA;
  });

  const sortedLanguageStats = {};
  for (const lang of sortedLanguages) {
    sortedLanguageStats[lang] = filteredLanguages[lang];
  }

  languageStats.languages = sortedLanguageStats;
}


app.listen(PORT, () => {
  console.log(`API server listening at http://localhost:${PORT}`);
});
