const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

//volunteerSphere 
//i3ZkFyRrs1OfdtDP

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.47zrhkq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    
    const volunteerPostCollection = client.db('volunteerSphere').collection('volunteers')

    app.post('/', async(req, res) => {
        const volunteersPost = req.body;
        const result = await volunteerPostCollection.insertOne(volunteersPost)
        res.send(result)
    })

    app.get('/', async(req, res) => {
        const result = await volunteerPostCollection.find().toArray()

      res.send(result)
    })
   
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error

  }
}
run().catch(console.dir);




app.listen(port, () => {
    console.log(`sarver is running on port ${port}`)
})
