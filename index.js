
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

// Root Route (Fixes "Cannot GET /")
app.get('/', (req, res) => {
  res.send('Welcome to IdeaaConnect Server!');
});

// app.get("/submits", (req, res) => {
//   res.send("GET route is working");
// });

// Mongo
const { MongoClient, ServerApiVersion } = require('mongodb');
console.log('mongodb');

// Middleware
app.use(cors());
app.use(express.json());

// Connection DB

console.log('before mongodb')
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ijgmrxw.mongodb.net/submit_db?retryWrites=true&w=majority&appName=Cluster0`;

const uri=`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ijgmrxw.mongodb.net/submit_db?retryWrites=true&w=majority&appName=Cluster0`;

console.log('connected')

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// db
// async function run() {
//   try {
//     // Connect the client to the server
   
//     // await client.connect();
//     //  console.log("2. Connected");

//     const firstdb=client.db("submit_db");
//       console.log("3. Database selected");
//     const submitsCollection =firstdb.collection("submits");
//       console.log("4. Collection selected");


//     // submits api
// //     app.get('/submits', async(req, res) => {
// //         console.log("5. GET /submits");
// //   res.send("GET route is working");

// // });
//     app.get("/submits", async (req, res) => {
//   try {
//     const result = await submitsCollection.find().toArray();
//     res.send(result);
//   } catch (error) {
//     console.error(error);

//     res.status(500).send({ message: "Failed to fetch submissions" });
//   }
// });

//     // app.get('/submits', async(req, res) => {
//     //    res.send("GET route is working");
//     //   const query={};
//     //   const cursor=submitsCollection.find(query);
//     //   const result=await cursor.toArray();
//     //   res.send(result);
//     // });
    
//     console.log("6. Route registered");

//    // new work 
//     //     app.get("/submits", async (req, res) => {
//     //   const email = req.query.email;

//     //   const query = {
//     //     studentemail: email,
//     //   };

//     //   const result = await submitsCollection.find(query).toArray();

//     //   res.send(result);
//     // });


//     //new work end

//     // post
//     app.post('/submits', async (req, res) => {
//   try {
//     const submit = req.body;
    

//     // Add system-controlled fields
//     submit.supervisorStatus = "pending";
//     submit.adminStatus = "pending";
//     submit.submittedAt = new Date();
//     submit.updatedAt = new Date();
//     console.log('posted');

//     const result = await submitsCollection.insertOne(submit);

//     res.status(201).send({
//       success: true,
//       message: "Submission successful",
//       insertedId: result.insertedId,
//     });

//   } catch (error) {
//     console.error(error);

//     res.status(500).send({
//       success: false,
//       message: "Failed to submit work",
//     });
//   }
// });









//     // app.post('/submits', async(req, res) => {
//     //   const submit = req.body;
//     //   const result = await submitsCollection.insertOne(submit);
//     //   res.send(result)

      
//     // });


//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } catch (error) {
//     console.error("Database connection error:", error);
//   }
// }
async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    console.log("2. Connected to MongoDB successfully!");

    const firstdb = client.db("submit_db");
    console.log("3. Database selected");
    const submitsCollection = firstdb.collection("submits");
    console.log("4. Collection selected");

    // All your routes go here...
    app.get("/submits", async (req, res) => {
      try {
        const result = await submitsCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to fetch submissions" });
      }
    });

    console.log("6. Route registered");

    app.post('/submits', async (req, res) => {
      try {
        const submit = req.body;
        submit.supervisorStatus = "pending";
        submit.adminStatus = "pending";
        submit.submittedAt = new Date();
        submit.updatedAt = new Date();
        console.log('posted');

        const result = await submitsCollection.insertOne(submit);

        res.status(201).send({
          success: true,
          message: "Submission successful",
          insertedId: result.insertedId,
        });
      } catch (error) {
        console.error(error);
        res.status(500).send({
          success: false,
          message: "Failed to submit work",
        });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    
  } catch (error) {
    console.error("Database connection error:", error);
  }
}

run().catch(console.dir);



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