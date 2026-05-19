const express = require('express')
const app = express()
const dotenv = require('dotenv')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { jwtVerify, createRemoteJWKSet } = require('jose-cjs');
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

const JWKS = createRemoteJWKSet(
    new URL(`${process.env.NEXT}/api/auth/jwks`)
)

const verifyData = async (req,res,next) => {
    const header = req.headers.authorization
    if(!header){
        res.status(401).json({message: "Unauthorized"})
    }
    const token = header.split(' ')[1]
    if(!token){
        res.status(401).json({message: "Unauthorized"})
    }

    try{
        const { payload } = await jwtVerify(token,JWKS)
        console.log(payload)
        next()
    }
    catch(error){
        res.status(403).json({message: "Forbidden"})
    }
}

const run = async () => {
    try {

        const db = client.db("assignment-9")
        const userCollection = db.collection("allData")
        const booking = db.collection('patientData')

        app.get("/user", async (req,res) => {

            const {search} = req.query
            let cursor;

            if(!search){
                cursor = await userCollection.find()
            }
            else{
                cursor = await userCollection.find({
                    $or:[
                        {
                            name:{
                                $regex: search,
                                $options: 'i'
                            }
                        },
                        {
                            description:{
                                $regex: search,
                                $options: 'i'
                            }
                        }
                    ]
                })
            }

            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/user/:id',verifyData , async (req,res) => {
            const {id} = req.params
            const result = await userCollection.findOne({_id: new ObjectId(id)})
            res.send(result)
        })

        app.post('/booking',verifyData , async (req,res) => {
            const newPatient = req.body
            const result = await booking.insertOne(newPatient)
            res.send(result)
        })

        app.get('/booking', async (req,res) => {
            const result = await booking.find().toArray()
            res.send(result)
        })

        app.delete('/booking/:id',verifyData , async (req,res) => {
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

        app.patch('/booking/:id',verifyData , async (req,res) => {
            const {id} = req.params
            const filter = {
                _id: new ObjectId(id)
            }
            const m = req.body
            const updateDocument = {
                $set: m
            }
            const result = await booking.updateOne(filter,updateDocument)
            res.send(result)
        })

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
