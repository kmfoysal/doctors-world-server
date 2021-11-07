const express = require('express')
const app = express()
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config()
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000

// Middleware 
app.use(cors());
app.use(express.json());


// MongoDB Connection 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.h80zj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run (){
    try{
        await client.connect();
        const database = client.db('doctors_world');
        const appointmentsCollection = database.collection('appointments');
        
        // Post API for Appointments 
        app.post('/appointments', async(req, res)=>{
            const appointment = req.body;
            const result = await appointmentsCollection.insertOne(appointment);
            res.json(result)
        })
    }
    finally{
        // await client.close()
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello Doctors World!')
})

app.listen(port, () => {
  console.log(`Server Running at ${port}`)
})