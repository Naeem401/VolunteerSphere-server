const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 9000;
const corsOptions = {
  origin: ['http://localhost:5173',
  'http://localhost:5174',
  'https://volunteersphere-3fe43.firebaseapp.com',
  'https://volunteersphere-3fe43.web.app'
  ], 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, 
};

app.use(cors(corsOptions));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.47zrhkq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const volunteerPostCollection = client.db('volunteerSphere').collection('volunteers');
    const volunteersCollection = client.db('volunteerSphere').collection('dummyVolunteers');

    // Create a new volunteer post
    app.post('/posts', async (req, res) => {
      const volunteersPost = req.body;
      const result = await volunteerPostCollection.insertOne(volunteersPost);
      res.send(result);
    });

    // Get volunteer posts with optional search term
    app.get('/posts', async (req, res) => {
      const searchTerm = req.query.title;
      let query = {};
      if (searchTerm) {
        query = { title: { $regex: searchTerm, $options: 'i' } };
      }
      const result = await volunteerPostCollection.find(query).sort({ deadline: 1 }).toArray();
      res.json(result);
    });

    // Get a single volunteer post by ID
    app.get('/post/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await volunteerPostCollection.findOne(query);
      res.send(result);
    });

    // Get volunteer posts by email
    app.get('/needVolunteerPost/:email', async (req, res) => {
      const email = req.params.email
      const query = { 'organizer.email': email }
      console.log(query)
      const result = await volunteerPostCollection.find((query)).toArray();
      console.log(`Query result: ${JSON.stringify(result)}`);
      res.send(result);
    });

    // Delete a volunteer post by ID
    app.delete('/mypost/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await volunteerPostCollection.deleteOne(query);
      res.send(result);
    });

    // Update a volunteer post by ID
    app.put('/volunteer-post/:id', async (req, res) => {
      const id = req.params.id;
      const updateData = req.body;
      const query = { _id: new ObjectId(id) }
      const options = { upsert: true }
      const updateDoc = {
        $set: {
          ...updateData,
        },
      }
      const result = await volunteerPostCollection.updateOne(query, updateDoc, options)
      res.send(result) 
    });

    // Get all dummy volunteers
    app.get('/dummyVolunteers', async (req, res) => {
      const result = await volunteersCollection.find().toArray();
      res.send(result);
    });

    // Ping MongoDB to confirm connection
    await client.db('admin').command({ ping: 1 });
    console.log('Successfully connected to MongoDB');
  } finally {
    // No need to close the client in this example as it should stay open while the server runs
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Server is Running');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
