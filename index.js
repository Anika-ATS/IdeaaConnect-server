
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



// Mongo
const { MongoClient, ServerApiVersion , ObjectId } = require('mongodb');
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

async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    console.log("2. Connected to MongoDB successfully!");

    const firstdb = client.db("submit_db");
    // console.log("3. Database selected");
    const submitsCollection = firstdb.collection("submits");
    const usersCollection = firstdb.collection("users");
    // console.log("4. Collection selected");

    // All  routes are here...
    // submitwork
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
   

    // techer dashboard
    app.get("/teacher-submissions/:email", async (req, res) => {
  try {
    const email = req.params.email;

    const query = {
      supervisorEmail: email,
    };

    const result = await submitsCollection.find(query).toArray();

    res.send(result);
  } catch (error) {
    console.error(error);

    res.status(500).send({
      success: false,
      message: "Failed to fetch submissions",
    });
  }
});

// final approval 

app.patch("/submits/approve/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const filter = {
      _id: new ObjectId(id),
    };

    const updateDoc = {
      $set: {
        supervisorStatus: "approved",
        updatedAt: new Date(),
      },
    };

    const result = await submitsCollection.updateOne(filter, updateDoc);

    console.log(result);

    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});


// fetch data to final approval page for admin approve for judge panel
app.get("/admin-pending-submissions", async (req, res) => {
  const result = await submitsCollection.find({
    adminStatus: "pending",
  }).toArray();

  res.send(result);
});

//after admin approval to assign judge page
app.patch("/admin/approve-submission/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const result = await submitsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          adminStatus: "approved",
          evaluationStatus: "waiting_assignment",
          updatedAt: new Date(),
        },
      }
    );

    res.send(result);
  } catch (err) {
    res.status(500).send(err);
  }
});


// fetch admin approve submission p & t to judge page
app.get("/approved-submissions",async(req,res)=>{

    const result=await submitsCollection.find({

        adminStatus:"approved",

        evaluationStatus:"waiting_assignment"

    }).toArray();

    res.send(result);

});

// fetch teacher list
app.get("/teachers", async (req, res) => {
  try {
    const teachers = await usersCollection.find({
      role: "teacher",
    }).toArray();

    res.send(teachers);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Failed to fetch teachers" });
  }
});

// app.get("/teachers",async(req,res)=>{

//     const result=await teachersCollection.find().toArray();

//     res.send(result);

// });

// assign judge

app.patch("/assign-judges/:id",async(req,res)=>{

    const id=req.params.id;

    const {judge1Email,judge2Email}=req.body;

    const result=await submitsCollection.updateOne(

        {_id:new ObjectId(id)},

        {
            $set:{

                judge1Email,

                judge2Email,

                evaluationStatus:"assigned",

                updatedAt:new Date()

            }
        }

    );

    res.send(result);

});

// pending /tracking information
    app.get("/admin/dashboard-stats", async (req, res) => {
      try {
        const pendingSubmission = await submitsCollection.countDocuments({
          adminStatus: "pending",
        });

        const assignedEvaluation = await submitsCollection.countDocuments({
          adminStatus: "judge_assigned",
        });

        const completedEvaluation = await submitsCollection.countDocuments({
          evaluationStatus: "completed",
        });

        const publishedWork = await submitsCollection.countDocuments({
          publishStatus: "published",
        });

        // Change this if your notices collection has a different name
        // const notices = await noticesCollection.countDocuments();
        
        const notices = 0;

        res.send({
          pendingSubmission,
          assignedEvaluation,
          completedEvaluation,
          publishedWork,
          notices,
        });
      } catch (err) {
        console.log(err);
        res.status(500).send({ message: "Failed to fetch dashboard stats" });
      }
    });


// email fetch

  app.get("/users/:email", async (req, res) => {

    try {

      const email = req.params.email;

      const user = await usersCollection.findOne({
        email,
      });

      res.send(user);

    } catch (error) {

      console.log(error);

      res.status(500).send({
        message: "Failed to fetch user",
      });

    }

  });

//role matching of teacher

    app.get("/teachers", async (req, res) => {

  try {

    const result = await usersCollection.find({
      role: "teacher",
    }).toArray();

    res.send(result);

  } catch (error) {

    console.log(error);

    res.status(500).send({
      message: "Failed to fetch teachers",
    });

  }

    });




    // after assigned judges by admin to teacher dashboard 
       app.get("/judge-assignments/:email", async (req, res) => {
        try {
          const email = req.params.email;

          const result = await submitsCollection.find({
            evaluationStatus: "assigned",
            $or: [
              { judge1Email: email },
              { judge2Email: email }
            ]
          }).toArray();

          console.log("Logged in teacher:", email);
          console.log("Assigned works:", result);

          res.send(result);
        } catch (error) {
          console.log(error);
          res.status(500).send({
            message: "Failed to fetch assigned evaluations",
          });
        }
      });




// post users

    app.post("/users", async (req, res) => {

      try {

        const user = req.body;

        const existingUser = await usersCollection.findOne({
          email: user.email,
        });

        if (existingUser) {

          return res.send({
            message: "User already exists",
          });

        }

        const result = await usersCollection.insertOne(user);

        res.send(result);

      } catch (error) {

        console.log(error);

        res.status(500).send({
          message: "Failed to save user",
        });

      }

    });



// post data from submitwork
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