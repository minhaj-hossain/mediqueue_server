const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

dotenv.config();

const uri = process.env.MONGODB_URI;

const app = express();
const port = process.env.PORT || 8000;


app.use(cors());
app.use(express.json());

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
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection

        const db = client.db("mediqueue");
        const tutorsCollection = db.collection("tutors");

        app.get("/tutors", async (req, res) => {
            const { search, startDate, endDate } = req.query;

            const query = {};

            if (search) {
                query.tutorName = { $regex: search, $options: "i" }; // case-insensitive
            }

            if (startDate || endDate) {
                query.sessionStartDate = {};
                if (startDate) query.sessionStartDate.$gte = startDate;
                if (endDate) query.sessionStartDate.$lte = endDate;
            }

            const tutors = await tutorsCollection.find(query).toArray();
            res.json(tutors);
        });


        app.post("/tutors", async (req, res) => {
            const tutor = req.body;
            const result = await tutorsCollection.insertOne(tutor);
            console.log(`New tutor created with the following id: ${result.insertedId}`);
            res.json(result);
        });
        





        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});