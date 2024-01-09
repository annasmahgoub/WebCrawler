const Crawler = require("crawler");
const url = require('url');
const { fruitPagesCollection, fruitLinksCollection } = require('./server');
const { title } = require("process");

// Database Cleanup:
async function cleanup() {
  await fruitPagesCollection.deleteMany({});
  await fruitLinksCollection.deleteMany({});
}

// This function initializes and starts the crawler.
async function startCrawler() {
  // Wait for the cleanup before starting the crawler.
  await cleanup();

  const visitedURLs = new Set();
  const c = new Crawler({
    maxConnections: 10,
    rateLimit: 10,
    callback: async function (error, res, done) {
      if (error) {
        console.error(error);
      } else {
        const $ = res.$; // jQuery object
        const currentURL = res.request.uri.href;
        console.log(`Crawling: ${currentURL}`);
  
        if (!visitedURLs.has(currentURL)) {
          // Store the content in the database

          const outgoingLinks = [];

          // Iterate over each anchor tag and extract the "href" attribute
          $('a').each(function () {
            let href = $(this).attr('href');

            // Check if href is an absolute URL or a relative URL
            let completeURL = new URL(href, 'https://people.scs.carleton.ca/~davidmckenney/fruitgraph/').href;

            outgoingLinks.push(completeURL);
          });

          function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                let j = Math.floor(Math.random() * (i + 1));
                let temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
            return array;
          }

          const incomingLinks = shuffleArray([...outgoingLinks]);

          const text = $('p').text().trim(); // Get the text content from <p> tags
          const words = text.split(/\s+/); // Tokenize into words (split by spaces)
          const wordFrequency = {};

          // Count the occurrences of each word
          for (const word of words) {
            if (wordFrequency[word]) {
              wordFrequency[word]++;
            } else {
              wordFrequency[word] = 1;
            }
          }

          await fruitPagesCollection.insertOne({
            url: currentURL,
            content: $('p').html().trim(), // Changed to 'body' to store the whole content
            title: $('title').html(),
            outgoingLinks: outgoingLinks,
            incomingLinks: incomingLinks,
            wordFrequency: wordFrequency,
          });
  
          visitedURLs.add(currentURL); // Add to visited URLs
  
          // Store the representation of the network of pages
          $("a[href]").each(async (index, element) => {
            const targetUrl = $(element).attr("href");
            const absoluteUrl = url.resolve(currentURL, targetUrl);
  
            // Ensuring that we only crawl and save links within the same domain for simplicity.
            if (url.parse(absoluteUrl).hostname === url.parse(currentURL).hostname) {
              await fruitLinksCollection.insertOne({
                source: currentURL,
                target: absoluteUrl
              });
  
              if (!visitedURLs.has(absoluteUrl)) {
                c.queue(absoluteUrl);
              }
            }
          });
        }
      }
      done();
    }
  });

  // Start crawling
  c.queue('https://people.scs.carleton.ca/~davidmckenney/fruitgraph/N-0.html');
}

// Start the crawler
startCrawler().catch(console.error);
