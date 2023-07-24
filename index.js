const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.83ramik.mongodb.net/?retryWrites=true&w=majority`;
// console.log(process.env.DB_User, process.env.DB_Pass);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection

    const collegeInfoCollection = client
      .db("college")
      .collection("college-info");

    const usersCollection = client.db("college").collection("users");

    const addCollegeCollection = client.db("college").collection("addCollege");

    const reviewCollection = client.db("college").collection("review");

    app.get("/collegeInfo", async (req, res) => {
      const collegeInfo = await collegeInfoCollection.find().toArray();
      res.send(collegeInfo);
    });

    app.get("/collegeInfo/:id", async (req, res) => {
      const id = req.params.id;
      const singleCollegeInfo = await collegeInfoCollection.findOne({
        _id: id,
      });
      res.send(singleCollegeInfo);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      //   console.log(user);

      const existingUser = await usersCollection.findOne({ email: user.email });
      //   console.log(existingUser);
      if (existingUser) {
        return res.send({ message: "User already exist" });
      }

      const result = await usersCollection.insertOne(user);
      //   console.log(result);
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.post("/addCollege", async (req, res) => {
      const college = req.body;
      console.log(college);
      const result = await addCollegeCollection.insertOne(college);
      res.send(result);
    });

    app.get("/addCollege", async (req, res) => {
      const result = await addCollegeCollection.find().toArray();
      res.send(result);
    });

    app.get("/myCollege/:email", async (req, res) => {
      const email = req.params.email;
      const myCollege = await addCollegeCollection
        .find({ email: email })
        .toArray();
      res.send(myCollege);
    });

    app.post("/reviews", async (req, res) => {
      const review = req.body;
      console.log(review);
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    app.get("/reviews", async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //     await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
