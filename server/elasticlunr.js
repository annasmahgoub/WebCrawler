const elasticlunr = require('elasticlunr');
const { MongoClient } = require('mongodb');

const mongoURI = 'mongodb+srv://tester:mohdLikesMen@cluster0.qq3so.mongodb.net/?retryWrites=true&w=majority'; // Replace with your MongoDB URI
const client = new MongoClient(mongoURI, {
  useNewUrlParser: true, // Add any necessary options
});

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('Error connecting to MongoDB Atlas:', error);
  }
}

connectToDatabase();

const db = client.db("4601DB"); // Replace with your database name
const fruitPagesCollection = db.collection('Fruit Pages');
const teamPagesCollection = db.collection('Team Pages');

const fruitIndex = elasticlunr(function () {
  this.addField('title');
  this.addField('body');
  this.addField('url');
  this.setRef('id');
});

const teamIndex = elasticlunr(function () {
  this.addField('title');
  this.addField('body');
  this.addField('url');
  this.setRef('id');
});

(async function () {
  const fruitPages = await fruitPagesCollection.find({}).toArray();
  fruitPages.forEach((page) => {
    fruitIndex.addDoc({
      id: page._id.toString(),
      title: page.title,
      body: page.content,
      url: page.url,
    });
  });

  const teamPages = await teamPagesCollection.find({}).toArray();
  teamPages.forEach((page) => {
    teamIndex.addDoc({
      id: page._id.toString(),
      title: page.Title,
      body: page.content,
      url: page.url,
    });
  });
})();

module.exports = {
  fruitIndex,
  teamIndex,
};
