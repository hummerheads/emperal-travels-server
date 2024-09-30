const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

const corsConfig = {
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
};
app.use(cors(corsConfig));
app.options("", cors(corsConfig));

app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://Amitumikeyahay:Amb0KzBetxDVVYBT@cluster0.ebsbi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Connect to MongoDB and set up routes
async function run() {
    try {
        const touristSpotCollections = client.db('spotDB').collection('spotCollections');
        const profiles = client.db('spotDB').collection('profileCollection');

        // Existing tourist spot routes...

        // User Registration
        app.post('/register', async (req, res) => {
            const { name, email, photoUrl } = req.body;

            try {
                const newUser = {
                    name,
                    email,
                    photoUrl,
                    bookmarkedSpots: [] // Initialize with an empty array
                };

                await profiles.insertOne(newUser);
                res.status(201).send({ message: 'User registered successfully' });
            } catch (error) {
                console.error("Error registering user:", error);
                res.status(400).send({ message: 'Error registering user', error });
            }
        });

        // Fetch User Profile
        app.get('/user/profile', async (req, res) => {
            const userId = req.user.uid; // Assuming you have middleware that sets req.user

            try {
                const userProfile = await profiles.findOne({ _id: new ObjectId(userId) });
                if (!userProfile) {
                    return res.status(404).send({ message: 'User profile not found' });
                }
                res.send(userProfile);
            } catch (error) {
                console.error("Error fetching user profile:", error);
                res.status(500).send({ message: 'Server error' });
            }
        });

        // Remove Bookmark
        app.delete('/user/bookmark/:userId/:spotId', async (req, res) => {
            const { userId, spotId } = req.params;

            try {
                await profiles.updateOne(
                    { _id: new ObjectId(userId) },
                    { $pull: { bookmarkedSpots: new ObjectId(spotId) } }
                );
                res.send({ message: 'Bookmark removed successfully' });
            } catch (error) {
                console.error("Error removing bookmark:", error);
                res.status(500).send({ message: 'Server error' });
            }
        });

        // Existing tourist spot routes...

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You are successfully connected to MongoDB!");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

// Start the server and run the database connection
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Emperal Travels Server is running');
});

app.listen(port, () => {
    console.log(`Emperal Server is listening on port: ${port}`);
});

module.exports = app; // Export your app for serverless deployment