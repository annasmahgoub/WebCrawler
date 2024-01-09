const express = require("express");
const { fruitIndex, teamIndex } = require("./elasticlunr");
const axios = require("axios");
const path = require("path");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { Matrix } = require("ml-matrix");
let pagerankResponseFruits = [];
let pagerankResponseTeams = [];

async function generateRanks() {
  pagerankResponseFruits = await axios.get(
    "http://localhost:4000/pagerank-fruits"
  );
  pagerankResponseTeams = await axios.get(
    "http://localhost:4000/pagerank-teams"
  );
  console.log("Pagerank Aquired");
}

generateRanks();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

const mongoURI =
  "mongodb+srv://tester:mohdLikesMen@cluster0.qq3so.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(mongoURI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas");
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error);
  }
}

connectToDatabase();

const db = client.db("4601DB");
const fruitPagesCollection = db.collection("Fruit Pages");
const fruitLinksCollection = db.collection("Fruit Links");
const teamPagesCollection = db.collection("Team Pages");
const teamLinksCollection = db.collection("Team Links");

module.exports = {
  fruitPagesCollection,
  fruitLinksCollection,
  teamPagesCollection,
  teamLinksCollection,
};

function createAdjacencyMatrix(pages, links) {
  const n = pages.length;
  const alpha = 0.1;
  const adjacencyMatrix = new Matrix(n, n).fill((1 / n) * alpha);
  const sourceMatrix = [];

  // Initialize sourceMatrix
  for (let i = 0; i < n; i++) {
    sourceMatrix.push([]);
  }

  // Fill the adjacency matrix based on your links
  links.forEach((link) => {
    const sourceIndex = pages.findIndex((page) => page.url === link.source);
    const targetIndex = pages.findIndex((page) => page.url === link.target);

    sourceMatrix[sourceIndex].push(targetIndex);
  });

  for (let i = 0; i < n; i++) {
    let m = sourceMatrix[i].length;
    for (let j = 0; j < m; j++) {
      let x = adjacencyMatrix.get(i, sourceMatrix[i][j]);
      adjacencyMatrix.set(i, sourceMatrix[i][j], (1 / m) * (1 - alpha) + x);
    }
  }
  return adjacencyMatrix;
}

function calculateDifference(vector1, vector2) {
  const diff = vector1.sub(vector2); // Calculate the distance between two vectors
  return diff.norm();
}

// Create an in-memory cache for PageRank data
const pageRankCache = new Map();

async function getPageRankData(collection, links, cacheKey) {
  // Check if the data is in the cache
  if (pageRankCache.has(cacheKey)) {
    return pageRankCache.get(cacheKey);
  }

  // If not in the cache, calculate and store in cache
  const pages = await collection.find({}).toArray();
  const adjacencyMatrix = createAdjacencyMatrix(pages, links);
  const n = adjacencyMatrix.rows;

  // Initialize the PageRank vector
  let x0 = new Matrix(1, n, 0);
  x0.set(0, 0, 1);

  let threshold = 0.0001;
  let temp;

  for (let i = 0; i < 25; i++) {
    temp = x0.clone();
    x0 = x0.mmul(adjacencyMatrix);

    const distance = calculateDifference(temp, x0);

    if (distance < threshold) {
      break;
    }
  }

  const pageRankValues = x0.to1DArray();
  const sortedPages = pages.map((page, index) => ({
    url: page.url,
    pr: pageRankValues[index],
  }));

  sortedPages.sort((a, b) => b.pr - a.pr);

  // Store in cache and return
  pageRankCache.set(cacheKey, sortedPages);
  return sortedPages;
}

app.get("/pagerank-fruits", async (req, res) => {
  try {
    const cacheKey = "fruits"; // Cache key for fruit PageRank data
    const links = await fruitLinksCollection.find({}).toArray(); // Get the links specific to fruit
    const pagerankData = await getPageRankData(
      fruitPagesCollection,
      links,
      cacheKey
    );
    res.json({ sortedPages: pagerankData });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

app.get("/pagerank-teams", async (req, res) => {
  try {
    const cacheKey = "teams"; // Cache key for teams PageRank data
    const links = await teamLinksCollection.find({}).toArray(); // Get the links specific to teams
    const pagerankData = await getPageRankData(
      teamPagesCollection,
      links,
      cacheKey
    );
    res.json({ sortedPages: pagerankData });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

app.get("/fruits", async (req, res) => {
  const query = req.query.q;
  const limit = parseInt(req.query.limit) || 10; // Parse the 'limit' query parameter or use the default value 10
  const maxLimit = 50; // Maximum limit allowed
  const boost = req.query.boost === "true"; // Parse the 'boost' query parameter

  // Search the index with the user's query
  const searchResults = fruitIndex.search(query).slice(0, maxLimit);
  const pagerankData = pagerankResponseFruits.data.sortedPages;
  const pagerankMap = new Map(
    pagerankData.map((entry) => [entry.url, entry.pr])
  ); // Create a map to quickly access PageRank data by URL
  const pages = await fruitPagesCollection.find({}).toArray();

  try {
    // Check if the 'q' parameter is empty, and if it is, return popular pages
    if (!query || searchResults.length === 0) {
      const popularPages = await fruitLinksCollection
        .aggregate([
          { $group: { _id: "$source", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: limit },
        ])
        .toArray();

      // Create a map to store outgoing links, incoming links, and word frequency
      const pageInfoMap = new Map();

      // Retrieve and store the necessary page information in the map
      pages.forEach((page) => {
        pageInfoMap.set(page.url, {
          ref: page._id,
          title: page.title,
          outgoingLinks: page.outgoingLinks,
          incomingLinks: page.incomingLinks,
          wordFrequency: page.wordFrequency,
        });
      });

      res.json(
        popularPages.map((page) => {
          const pageInfo = pageInfoMap.get(page._id);
          return {
            name: 'Annas Mahgoub, Waddah Almoufti, Omar Abdelhadi',
            ref: pageInfo.ref,
            url: page._id,
            title: pageInfo.title,
            score: Number(0).toPrecision(6),
            pr: Number(0).toPrecision(6),
            outgoingLinks: pageInfo.outgoingLinks,
            incomingLinks: pageInfo.incomingLinks,
            wordFrequency: pageInfo.wordFrequency,
          };
        })
      );
    } else {
      if (limit < 1) {
        return res.status(400).json({ message: "Limit must be at least 1" });
      } else if (limit > maxLimit) {
        return res
          .status(400)
          .json({
            message: `Limit exceeds the maximum allowed limit of ${maxLimit}`,
          });
      }

      // Create an array to store the search results with additional fields
      const resultsWithDetails = searchResults.map((result) => {
        const pageId = result.ref; // Get the page ID
        const page = pages.find((p) => p._id.toString() === pageId); // Find the corresponding page in your MongoDB collection
        const pagerank = pagerankMap.get(page.url); // Get PageRank based on the URL
        if (page) {
          const score = boost ? result.score * pagerank : result.score;
          return {
            name: 'Annas Mahgoub, Waddah Almoufti, Omar Abdelhadi',
            ref: pageId,
            score: score.toPrecision(6),
            url: page.url, // Include the URL
            title: page.title, // Include the Title
            pr: pagerank.toPrecision(6), // Include the Pagerank
            outgoingLinks: page.outgoingLinks, // include outgoing links
            incomingLinks: page.incomingLinks, // include incoming links
            wordFrequency: page.wordFrequency, // include word frequency
          };
        }
        return null; // Return null if the page is not found (handle this case as needed)
      });

      const validResults = resultsWithDetails.filter((result) => result);
      const sortedResults = validResults.sort((a, b) => b.score - a.score);
      const slicedResults = sortedResults.slice(0, limit);

      console.log("HERE IT IS:::: ", slicedResults);
      // Send the search results as a JSON response
      res.json(slicedResults);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

app.get("/personal", async (req, res) => {
  const query = req.query.q;
  const limit = parseInt(req.query.limit) || 10; // Parse the 'limit' query parameter or use the default value 10
  const maxLimit = 50; // Maximum limit allowed
  const boost = req.query.boost === "true"; // Parse the 'boost' query parameter

  // Search the index with the user's query
  const searchResults = teamIndex.search(query).slice(0, maxLimit);
  const pagerankData = pagerankResponseTeams.data.sortedPages;
  const pagerankMap = new Map(
    pagerankData.map((entry) => [entry.url, entry.pr])
  ); // Create a map to quickly access PageRank data by URL
  const pages = await teamPagesCollection.find({}).toArray();

  try {
    // Check if the 'q' parameter is empty, and if it is, return popular pages
    if (!query || searchResults.length === 0) {
      const popularPages = await teamLinksCollection
        .aggregate([
          { $group: { _id: "$source", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: limit },
        ])
        .toArray();

      // Create a map to store outgoing links, incoming links, and word frequency
      const pageInfoMap = new Map();

      // Retrieve and store the necessary page information in the map
      pages.forEach((page) => {
        pageInfoMap.set(page.url, {
          ref: page._id,
          title: page.title,
          outgoingLinks: page.outgoingLinks,
          incomingLinks: page.incomingLinks,
          wordFrequency: page.wordFrequency,
        });
      });

      res.json(
        popularPages.map((page) => {
          const pageInfo = pageInfoMap.get(page._id);
          return {
            name: 'Annas Mahgoub, Waddah Almoufti, Omar Abdelhadi',
            ref: pageInfo.ref,
            url: page._id,
            title: pageInfo.title,
            score: Number(0).toPrecision(6),
            pr: Number(0).toPrecision(6),
            outgoingLinks: pageInfo.outgoingLinks,
            incomingLinks: pageInfo.incomingLinks,
            wordFrequency: pageInfo.wordFrequency,
          };
        })
      );
    } else {
      if (limit < 1) {
        return res.status(400).json({ message: "Limit must be at least 1" });
      } else if (limit > maxLimit) {
        return res
          .status(400)
          .json({
            message: `Limit exceeds the maximum allowed limit of ${maxLimit}`,
          });
      }

      // Create an array to store the search results with additional fields
      const resultsWithDetails = searchResults.map((result) => {
        const pageId = result.ref; // Get the page ID
        const page = pages.find((p) => p._id.toString() === pageId); // Find the corresponding page in your MongoDB collection
        const pagerank = pagerankMap.get(page.url); // Get PageRank based on the URL
        if (page) {
          const score = boost ? result.score * pagerank : result.score;
          return {
            name: 'Annas Mahgoub, Waddah Almoufti, Omar Abdelhadi',
            ref: pageId,
            score: score.toPrecision(6),
            url: page.url, // Include the URL
            title: page.title, // Include the Title
            pr: pagerank.toPrecision(6), // Include the Pagerank
            outgoingLinks: page.outgoingLinks,
            incomingLinks: page.incomingLinks,
            wordFrequency: page.wordFrequency,
          };
        }
        return null; // Return null if the page is not found (handle this case as needed)
      });

      const validResults = resultsWithDetails.filter((result) => result);
      const sortedResults = validResults.sort((a, b) => b.score - a.score);
      const slicedResults = sortedResults.slice(0, limit);

      // Send the search results as a JSON response
      res.json(slicedResults);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
