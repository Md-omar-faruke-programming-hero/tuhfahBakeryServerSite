const express= require('express');
const { MongoClient } = require('mongodb');
const cors=require('cors')
const ObjectId= require('mongodb').ObjectId

const app=express()
const port= process.env.PORT || 5000
require('dotenv').config()

// middleware
app.use(cors())
app.use(express.json())

app.get('/',(req,res)=>{
    res.send("server connected")
})
app.listen(port,()=>{
    console.log("listening port",port)
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eqb98.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
        await client.connect()
        const dataBase= client.db('cakeShop')
        const cakeCollection= dataBase.collection('allCake')
        const userOrderInfoCollection= dataBase.collection('userOrder')


        // get all cake
        app.get('/allCake',async(req,res)=>{
                const cursor = cakeCollection.find({})
                const result= await cursor.toArray()
                res.send(result)

        })

        // get single cake details
        app.get('/cakeDetails/:id',async(req,res)=>{
            const id = req.params.id;
            const query= {_id: ObjectId(id)}
            const corsor= cakeCollection.find(query)
            const result= await corsor.toArray()
            res.send(result)

        })

        // all user order post
        app.post('/user/order',async(req,res)=>{
            console.log(req.body)
            const orderPlaceDate=new Date().toLocaleDateString()
            const userOrder={
                ...req.body,orderPlaceDate,paymentDate:"payment not clear yet"
            }
            const result= await userOrderInfoCollection.insertOne(userOrder)
            res.json(result)
            console.log(result)
        })



    }
    finally{

    }

}
run().catch(console.dir)

