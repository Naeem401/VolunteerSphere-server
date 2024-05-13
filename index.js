const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())


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
    const volunteersCollection = client.db('volunteerSphere').collection('dummyVolunteers')

    app.post('/', async(req, res) => {
        const volunteersPost = req.body;
        const result = await volunteerPostCollection.insertOne(volunteersPost)
        res.send(result)
    })

    app.get('/', async(req, res) => {
      const searchTerm = req.query.title;

      let query = {}; 
      if (searchTerm) {
        query = { title: { $regex: searchTerm, $options: 'i' } };
      }

      const result = await volunteerPostCollection.find(query).sort({ deadline: 1 }).toArray();
      res.json(result);
    })
     // Get a single data from db using id
     app.get('/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await volunteerPostCollection.findOne(query)
      res.send(result)
    })

    //get 6 data used in home
    app.get('/home', async (req, res) => {
      const result = await volunteerPostCollection.find().limit(6).sort({ deadline: 1 }).toArray();

        res.json(result);
    })
  
    app.get('/dummyVolunteers', async(req, res) => {
      const result = await volunteersCollection.find().toArray()

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
