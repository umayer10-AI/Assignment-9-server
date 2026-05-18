const express = require('express')
const app = express()
const dotenv = require('dotenv')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000
dotenv.config()

app.use(cors())
app.use(express.json())

const uri = process.env.MY

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const run = async () => {
    try {
        await client.connect();

        const db = client.db("assignment-9")
        const userCollection = db.collection("allData")
        const booking = db.collection('patientData')

        app.get("/user", async (req,res) => {
            const cursor = await userCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/user/:id', async (req,res) => {
            const {id} = req.params
            const result = await userCollection.findOne({_id: new ObjectId(id)})
            res.send(result)
        })

        app.post('/booking', async (req,res) => {
            const newPatient = req.body
            const result = await booking.insertOne(newPatient)
            res.send(result)
        })

        app.get('/booking', async (req,res) => {
            const result = await booking.find().toArray()
            res.send(result)
        })

        app.delete('/booking/:id', async (req,res) => {
            const {id} = req.params
            const filter ={
                _id: new ObjectId(id)
            }
            const result = await booking.deleteOne(filter)
            res.json(result)
        })

        app.get('/booking/:id',async (req,res) => {
            const {id} = req.params
            const result = await booking.findOne({_id: new ObjectId(id)})
            res.send(result)
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
