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
        const usersCollection = database.collection('users');


        // Get API for Appointments Details
        app.get('/appointmentsDetails', async(req, res)=>{
          const email = req.query.email;
          const date = new Date(req.query.date).toLocaleDateString();
          console.log(email,date);
          const query = {email:email, date:date};
          const cursor = appointmentsCollection.find(query);
          console.log(query);
          const appointmentsDetails = await cursor.toArray();
          res.json(appointmentsDetails);
        })

        // Get Api for Admin Access 
        app.get('/users/:email', async(req,res)=>{
          const email = req.params.email;
          const query = {email:email};
          const user = await usersCollection.findOne(query);
          let isAdmin = false;

          if(user?.role === 'admin'){
            isAdmin = true;
          }
          res.json({admin : isAdmin});
        })

        // Get Api For Payment 
        app.get('/appointments/:id', async(req, res)=>{
          const id = req.params.id;
          const query = {_id: ObjectId(id)}
          const result = await appointmentsCollection.findOne(query)
          res.json(result);
        })
        
        // Post API for Appointments 
        app.post('/appointments', async(req, res)=>{
            const appointment = req.body;
            const result = await appointmentsCollection.insertOne(appointment);
            res.json(result)
        })

        // Post api for create user
        app.post('/users', async(req, res)=>{
          const user = req.body;
          const result = await usersCollection.insertOne(user);
            res.json(result)
        })

        // Put api for upsart google login
        app.put('/users', async(req, res)=>{
          const user = req.body;
          const filter = {email: user.email};
          const options = {upsert:true};
          const updateUser = {$set: user};
          const result = await usersCollection.updateOne(filter, updateUser, options)
          res.json(result);
        })

        // Put api for update user role
        app.put('/users/admin', async(req, res)=>{
          const user = req.body;
          const filter = {email: user.email};
          const updateUser = {$set: {role: 'admin'}};
          const result = await usersCollection.updateOne(filter, updateUser)
          res.json(result);
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