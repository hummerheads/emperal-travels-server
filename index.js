const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

const corsConfig = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};
app.use(cors(corsConfig));
app.options("", cors(corsConfig));

app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://Amitumikeyahay:Amb0KzBetxDVVYBT@cluster0.ebsbi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const touristSpotCollections = client
      .db("spotDB")
      .collection("spotCollections");
    const profiles = client.db("spotDB").collection("profileCollection");

    app.get("/all-tourist-spots", async (req, res) => {
      const cursor = touristSpotCollections.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/all-tourist-spots/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await touristSpotCollections.findOne(query);
      res.send(result);
    });

    app.post("/add-tourist-spot", async (req, res) => {
      const newTouristSpot = req.body;
      console.log(newTouristSpot);

      try {
        const result = await touristSpotCollections.insertOne(newTouristSpot);
        res.status(201).send(result);
      } catch (error) {
        console.error("Error inserting document:", error);
        res.status(500).send("Error inserting document");
      }
    });

    app.put("/all-tourist-spots/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedTouristSpot = req.body;
      const TouristSpot = {
        $set: {
          image: updatedTouristSpot.image,
          tourists_spot_name: updatedTouristSpot.tourists_spot_name,
          country_Name: updatedTouristSpot.country_Name,
          location: updatedTouristSpot.location,
          short_description: updatedTouristSpot.short_description,
          average_cost: updatedTouristSpot.average_cost,
          seasonality: updatedTouristSpot.seasonality,
          travel_time: updatedTouristSpot.travel_time,
          totaVisitorsPerYear: updatedTouristSpot.totaVisitorsPerYear,
          user_email: updatedTouristSpot.user_email,
          user_name: updatedTouristSpot.user_name,
        },
      };

      const existingSpot = await touristSpotCollections.findOne(filter);
      console.log("Existing spot:", existingSpot);
      console.log("Updated data:", updatedTouristSpot);

      const result = await touristSpotCollections.updateOne(
        filter,
        TouristSpot,
        options
      );
      res.send(result);
    });

    app.delete("/all-tourist-spots/:id", async (req, res) => {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ error: "Invalid ID format" });
      }

      const query = { _id: new ObjectId(id) };

      try {
        const result = await touristSpotCollections.deleteOne(query);

        if (result.deletedCount === 0) {
          return res.status(404).send({ error: "Tourist spot not found" });
        }

        res.send(result);
      } catch (error) {
        console.error("Error deleting document:", error);
        res.status(500).send({ error: "Error deleting document" });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You are successfully connected to MongoDB!"
    );
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Emperal Travels Server is running");
});

app.listen(port, () => {
  console.log(`Emperal Server is listening on port: ${port}`);
});

module.exports = app;
