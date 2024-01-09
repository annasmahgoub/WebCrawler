const Crawler = require("crawler");
const url = require('url');
const { teamPagesCollection, teamLinksCollection } = require('./server');

// Database Cleanup:
async function cleanup() {
  await teamPagesCollection.deleteMany({});
  await teamLinksCollection.deleteMany({});
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
        const $ = res.$; // jQuery-like object for the DOM
        const currentURL = res.request.uri.href;
        console.log(`Crawling: ${currentURL}`);
  
        if (!visitedURLs.has(currentURL)) {
          // Store the content in the database
          let content = '';

          // Iterate over each <p> tag and add its text content with a space
          $('p').each(function () {
            content += $(this).text() + ' ';
          });

          const outgoingLinks = [];
          // Iterate over each anchor tag and extract the "href" attribute
          $('a').each(function () {
            let href = $(this).attr('href');

            // Check if href is an absolute URL or a relative URL
            let completeURL = new URL(href, 'https://annasmahgoub.github.io/Personal/').href;

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

          await teamPagesCollection.insertOne({
            url: currentURL,
            content: $('p').html().trim(), // Changed to 'body' to store the whole content
            title: $('h1').text(), // Assuming there is only one h1 per page
            outgoingLinks: outgoingLinks,
            incomingLinks: incomingLinks,
            wordFrequency: wordFrequency,
          });

          visitedURLs.add(currentURL); // Add to visited URLs
  
          // Process only the links within the 'recently-viewed' section
          $("a[href]").each(async (index, element) => {
            const targetUrl = $(element).attr("href");
            const absoluteUrl = url.resolve(currentURL, targetUrl);
  
            if (url.parse(absoluteUrl).hostname === url.parse(currentURL).hostname) {
              await teamLinksCollection.insertOne({
                source: currentURL,
                target: absoluteUrl
              });
  
              // Queue the new URLs if they haven't been visited
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

  // Start crawling from the specified URL
  c.queue('https://annasmahgoub.github.io/Personal/Personal_0.html');
}

// Start the crawler
startCrawler().catch(console.error);
