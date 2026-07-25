const dns = require('dns');
// Set custom DNS to bypass local ISP/router DNS resolution issues
dns.setServers(['8.8.8.8', '1.1.1.1']);

const dotenv = require('dotenv');
// Load environment variables immediately before constructing uri
dotenv.config();

const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Mongo
const { MongoClient, ServerApiVersion } = require('mongodb');

// Middleware
app.use(cors());
app.use(express.json());

// Connection DB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ijgmrxw.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("Database connection error:", error);
  }
}
run().catch(console.dir);

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to IdeaaConnect Server!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});








































// const express = require('express');
// const cors = require('cors');


// const dotenv = require('dotenv');

// const app = express();
// const port =process.env.PORT || 3000

// //load environment varriables from .env file
// dotenv.config()

// // mongo

// const { MongoClient, ServerApiVersion } = require('mongodb');



// // Middleware
// app.use(cors());
// app.use(express.json());

// // connectiondb
// const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ijgmrxw.mongodb.net/?appName=Cluster0`;

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });


// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();
//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     // await client.close();
//   }
// }
// run().catch(console.dir);








// // Routes
// app.get('/', (req, res) => {
//   res.send('Welcome to IdeaaConnect Server!');
// });
// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })

// // Start server
// // const PORT = process.env.PORT || 5000;
// // app.listen(PORT, () => {
// //   console.log(`Server running on port ${PORT}`);
// // });