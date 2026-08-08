
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

// {
//   "_id": {
//     "$oid": "6a724dcb5f49cc2878611527"
//   },
//   "name": "Mayesha Tarannum",
//   "email": "mayeshatarannum61@gmail.com",
//   "role": "student",
//   "batch": "7",
//   "idNumber": "2023822069",
//   "createdAt": "2026-08-04T20:38:35.317Z"
// }

// Mongo
const { MongoClient, ServerApiVersion , ObjectId } = require('mongodb');
console.log('mongodb');

// Middleware
app.use(cors());
app.use(express.json());

// Connection DB

console.log('before mongodb')

//uri of mongodb
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
   
    const submitsCollection = firstdb.collection("submits");
   
    const usersCollection = firstdb.collection("users");
    const adminCollection = firstdb.collection("admins");
     const pendingUserCollection = firstdb.collection("pendingUsers");
    const noticeCollection = firstdb.collection("notice");
  

    // All  routes are here...

    // app.get("/admins/:email", async (req, res) => {
    //   try {
    //     const email = req.params.email;

    //     const admin = await adminCollection.findOne({
    //       email: email,
    //       role: "admin",
    //     });

    //     if (!admin) {
    //       return res.status(404).send({
    //         message: "Admin not found",
    //       });
    //     }

    //     res.send(admin);

    //   } catch (error) {
    //     console.error("Admin fetch error:", error);

    //     res.status(500).send({
    //       message: "Failed to fetch admin",
    //     });
    //   }
    // });
    
    app.get("/admins/:email", async (req, res) => {
      try {
        const email = req.params.email;

        console.log("=================================");
        console.log("ADMIN ROUTE CALLED");
        console.log("EMAIL:", email);

        const allAdmins = await adminCollection.find({}).toArray();

        console.log("ALL ADMINS:", allAdmins);

        const admin = await adminCollection.findOne({
          email: email,
          role: "admin",
        });

        console.log("MATCHED ADMIN:", admin);
        console.log("=================================");

        if (!admin) {
          return res.status(404).send({
            message: "Admin not found",
            searchedEmail: email,
          });
        }

        res.send(admin);

      } catch (error) {
        console.error("ADMIN ERROR:", error);

        res.status(500).send({
          message: "Failed to fetch admin",
        });
      }
    });


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
   

    // get techer dashboard
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






app.patch("/assign-judges/:id",async(req,res)=>{

    const id=req.params.id;

    const {judge1Email,judge2Email}=req.body;

    const result=await submitsCollection.updateOne(

        {_id:new ObjectId(id)},

        {
            $set: {
                judge1Email,
                judge2Email,

                judge1Evaluation: null,
                judge2Evaluation: null,

                totalMarks: 30,
                passMarks: 15,

                averageMarks: null,
                result: null,

                evaluationStatus: "assigned",
                updatedAt: new Date()
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

        // const assignedEvaluation = await submitsCollection.countDocuments({
        //   adminStatus: "judge_assigned",
        // });
        const assignedEvaluation = await submitsCollection.countDocuments({
          evaluationStatus: "assigned",
        });

        const completedEvaluation = await submitsCollection.countDocuments({
          evaluationStatus: "completed",
          // publishStatus: "pending",
          result: "Pass",
        });

        const publishedWork = await submitsCollection.countDocuments({
          publishStatus: "published",
        });

        // Change this if your notices collection has a different name
        const notices = await noticesCollection.countDocuments();
        
        // const notices = 0;

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

// get pending users
  app.get("/pending-user", async (req, res) => {
    try {
      const users = await pendingUserCollection
        .find()
        .sort({ createdAt: -1 })
        .toArray();

      res.send(users);

    } catch (error) {
      console.error(error);

      res.status(500).send({
        message: "Failed to fetch pending users.",
      });
    }
  });




// users email fetch

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
            }).project({
              name: 1,
              email: 1,
              _id: 0,
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


      //  evaluate page 
      app.get("/submission/:id", async (req, res) => {
        try {
          const id = req.params.id;

          const result = await submitsCollection.findOne({
            _id: new ObjectId(id),
          });

          res.send(result);

        } catch (error) {
          console.log(error);
          res.status(500).send({
            message: "Failed to fetch submission",
          });
        }
      });

      // submit evaluation
      app.patch("/submit-evaluation/:id", async (req, res) => {
          try {

            const id = req.params.id;

            const {
              judgeEmail,
              marks,
              totalMarks,
              passMarks,
              comment,
            } = req.body;

            const submission = await submitsCollection.findOne({
              _id: new ObjectId(id),
            });

            if (!submission) {
              return res.status(404).send({
                message: "Submission not found",
              });
            }

            let updateDoc = {};

            // Judge 1 submits
            if (submission.judge1Email === judgeEmail) {

              if (submission.judge1Evaluation) {
                return res.send({
                  message: "Judge 1 already submitted.",
                });
              }

              updateDoc.judge1Evaluation = {
                marks,
                comment,
              };
              
              updateDoc.totalMarks = totalMarks;
              updateDoc.passMarks = passMarks;
            }

            // Judge 2 submits
            else if (submission.judge2Email === judgeEmail) {

              if (submission.judge2Evaluation) {
                return res.send({
                  message: "Judge 2 already submitted.",
                });
              }

              updateDoc.judge2Evaluation = {
                marks,
                comment,
              };
              updateDoc.totalMarks = totalMarks;
              updateDoc.passMarks = passMarks;
            }

            else {
              return res.status(403).send({
                message: "You are not assigned as a judge.",
              });
            }

            updateDoc.updatedAt = new Date();

            await submitsCollection.updateOne(
              { _id: new ObjectId(id) },
              {
                $set: updateDoc,
              }
            );

            // Fetch updated submission
            const updatedSubmission = await submitsCollection.findOne({
              _id: new ObjectId(id),
            });

            // If both judges have evaluated
            if (
              updatedSubmission.judge1Evaluation &&
              updatedSubmission.judge2Evaluation
            ) {

              const averageMarks =
                (
                  updatedSubmission.judge1Evaluation.marks +
                  updatedSubmission.judge2Evaluation.marks
                ) / 2;

              const result =
                averageMarks >= updatedSubmission.passMarks
                  ? "Pass"
                  : "Fail";

              await submitsCollection.updateOne(
                { _id: new ObjectId(id) },
                {
                  $set: {
                    averageMarks,
                    result,
                    evaluationStatus: "completed",
                  },
                }
              );
            }

            res.send({
              modifiedCount: 1,
            });

          } catch (error) {

            console.log(error);

            res.status(500).send({
              message: "Evaluation submission failed",
            });
          }
      });







      // after completed evaluation
      app.get("/evaluation-results", async (req, res) => {
        try {

          const result = await submitsCollection.find({
              evaluationStatus: "completed",
              publishStatus: "pending",
              result: "Pass"
          }).toArray();

          res.send(result);

        } catch (error) {

          console.log(error);

          res.status(500).send({
            message: "Failed to fetch evaluation results"
          });
        }
      });

      // publish result btn details

      app.patch("/publish-work/:id", async (req, res) => {

        const id = req.params.id;

        const result = await submitsCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              publishStatus: "published",
              publishedAt: new Date(),
               publicationYear: new Date().getFullYear().toString()
            }
          }
        );

        res.send(result);
      });
      
      // get projects to publish

      app.get("/projects", async (req, res) => {

        const result = await submitsCollection.find({

          publishStatus: "published",

          workType: "project"

        }).toArray();

        res.send(result);

      });

       // get thesis to publish

      app.get("/thesis", async (req, res) => {

        const result = await submitsCollection.find({

          publishStatus: "published",

          workType: "thesis"

        }).toArray();

        res.send(result);

      });








    // rejected btn details 
    app.patch("/reject-work/:id", async (req, res) => {

      const id = req.params.id;

      const result = await submitsCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            publishStatus: "rejected"
          }
        }
      );

      res.send(result);
    });
    

    //approve user here
    app.patch("/pending-user/approve/:id", async (req, res) => {
      try {
        const id = req.params.id;

        // Find pending user
        const pendingUser = await pendingUserCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!pendingUser) {
          return res.status(404).send({
            message: "Pending user not found.",
          });
        }

        // Check if already exists in users collection
        const existingUser = await usersCollection.findOne({
          email: pendingUser.email,
        });

        if (existingUser) {
          return res.status(409).send({
            message: "This user already exists in the users collection.",
          });
        }

        // Prepare approved user data
        const approvedUser = {
          name: pendingUser.name,
          email: pendingUser.email,
          role: pendingUser.role,
          batch: pendingUser.role === "student"
            ? pendingUser.batch
            : "",
          idNumber: pendingUser.idNumber,
          createdAt: pendingUser.createdAt,
        };

        // Insert into users collection
        const userResult = await usersCollection.insertOne(
          approvedUser
        );

        // Delete from pendingUsers collection
        await pendingUserCollection.deleteOne({
          _id: new ObjectId(id),
        });

        res.send({
          success: true,
          message: "User approved successfully.",
          insertedId: userResult.insertedId,
        });

      } catch (error) {
        console.error("Approve user error:", error);

        res.status(500).send({
          message: "Failed to approve user.",
        });
      }
    });


    // noticePage

    app.get("/notices", async (req, res) => {
        try {

          const notices = await noticeCollection
            .find()
            .sort({ date: -1 })
            .toArray();
v
          res.send(notices);

        } catch (error) {

          console.error("Failed to fetch notices:", error);

          res.status(500).send({
            message: "Failed to fetch notices",
          });

        }
    });



// post users
    app.post("/pending-user", async (req, res) => {
      try {
        const userInfo = req.body;

        // Check whether this email already exists
        const existingUser = await usersCollection.findOne({
          email: userInfo.email,
        });

        if (existingUser) {
          return res.status(409).send({
            message: "This email is already approved.",
          });
        }

        // Check whether already waiting for approval
        const existingPendingUser =
          await pendingUserCollection.findOne({
            email: userInfo.email,
          });

        if (existingPendingUser) {
          return res.status(409).send({
            message: "This account is already waiting for approval.",
          });
        }

        const result = await pendingUserCollection.insertOne(
          userInfo
        );

        res.send(result);

      } catch (error) {
        console.error(error);

        res.status(500).send({
          message: "Failed to submit registration for approval.",
        });
      }
    });


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

// notices page
    app.post("/notices", async (req, res) => {
      try {
        const notice = req.body;

        const result = await noticeCollection.insertOne(notice);

        res.send({
          success: true,
          message: "Notice published successfully",
          insertedId: result.insertedId,
        });

      } catch (error) {
        console.error("Notice creation error:", error);

        res.status(500).send({
          success: false,
          message: "Failed to publish notice",
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