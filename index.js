const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');

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

const JWKS = createRemoteJWKSet(
    new URL(`http://localhost:3000/api/auth/jwks`)
)

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header is missing.' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token is missing.' });
    }

    try {
        const { payload } = await jwtVerify(token, JWKS)
       
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token.' });
    }


}

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection

        const db = client.db("mediqueue");
        const tutorsCollection = db.collection("tutors");
        const bookingsCollection = db.collection("bookings");

        app.get("/tutors", async (req, res) => {
            const { search, startDate, endDate } = req.query;

            const query = {};

            if (search) {
                query.tutorName = { $regex: search, $options: "i" };
            }

            if (startDate || endDate) {
                query.sessionStartDate = {};
                if (startDate) query.sessionStartDate.$gte = startDate;
                if (endDate) query.sessionStartDate.$lte = endDate;
            }

            const tutors = await tutorsCollection.find(query).toArray();
            res.json(tutors);
        });


        app.get("/tutors/:id",verifyToken, async (req, res) => {
            try {
                const tutor = await tutorsCollection.findOne({ _id: new ObjectId(req.params.id) });
                if (!tutor) return res.status(404).json({ message: 'Tutor not found.' });
                res.json(tutor);
            } catch (err) {
                res.status(500).json({ message: err.message });
            }
        });

        app.get('/my-tutors/:id',verifyToken, async (req, res) => {
            const { id } = req.params;

            const result = await tutorsCollection.find({ userId: id }).toArray();
            res.send(result)
        })


        app.patch("/tutors/:id/decrease-slot",verifyToken, async (req, res) => {
            try {
                const tutor = await tutorsCollection.findOne({ _id: new ObjectId(req.params.id) });

                if (!tutor) return res.status(404).json({ message: 'Tutor not found.' });
                if (tutor.totalSlot <= 0) return res.status(400).json({ message: 'No slots remaining.' });

                const result = await tutorsCollection.updateOne(
                    { _id: new ObjectId(req.params.id) },
                    { $inc: { totalSlot: -1 } }
                );
                res.json(result);
            } catch (err) {
                res.status(500).json({ message: err.message });
            }
        });



        app.post('/tutors', verifyToken, async (req, res) => {
            try {

                const tutorData = req.body;

                const result = await tutorsCollection.insertOne(tutorData);

                res.send(result);

            } catch (err) {
               
                res.status(500).send({
                    message: err.message
                });
            }
        });

        app.post("/bookings",verifyToken, async (req, res) => {
            try {
                const booking = {
                    ...req.body,
                    bookedAt: new Date(),
                };
                const result = await bookingsCollection.insertOne(booking);
                res.status(201).json(result);
               
            } catch (err) {
                res.status(500).json({ message: err.message });
            }
        });

        app.get("/bookings/:id",verifyToken, async (req, res) => {

            const { id } = req.params;

            try {
                const booking = await bookingsCollection.find({ userId: id }).toArray();
                if (!booking) return res.status(404).json({ message: 'Booking not found.' });

                res.json(booking);
            } catch (err) {
                res.status(500).json({ message: err.message });
            }
        })

        app.get('/top-tutors', async (req, res) => {
            const result = await tutorsCollection.find().limit(6).toArray();
            res.json(result)
        })





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