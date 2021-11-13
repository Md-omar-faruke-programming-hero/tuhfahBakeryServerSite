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
        const allUserCollection=dataBase.collection("allUser")
        const userReviewCollection=dataBase.collection('userReview')
        


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
        // single cake delete
        app.delete('/cakeDetails/:id',async(req,res)=>{
            const id=req.params.id;
            const query={_id:ObjectId(id)}
            const result= await cakeCollection.deleteOne(query)
            res.json(result)
            console.log(result);
        })

        // all user order post
        app.post('/user/order',async(req,res)=>{
            
            const orderPlaceDate=new Date().toLocaleDateString()
            const userOrder={
                ...req.body,orderPlaceDate,paymentDate:"payment not clear yet"
            }
            const result= await userOrderInfoCollection.insertOne(userOrder)
            res.json(result)
            
        })


        // user order get
        app.get('/user/order',async(req,res)=>{
            console.log(req.query)
            let filter={}
            const email= req.query.email
            
            if(email){
                filter={email:email}
             }
           const cursor= userOrderInfoCollection.find(filter)
            const result= await cursor.toArray()
            res.send(result)

        })

        // user single order get
        app.get('/user/order/:id',async(req,res)=>{
            const id=req.params.id;
            const query={_id:ObjectId(id)}
            const cursor=userOrderInfoCollection.find(query)
            const result=await cursor.toArray()
            res.send(result)
        })

        // user single oder delete
        app.delete('/user/order/:id',async(req,res)=>{
            const id=req.params.id;
            const query={_id:ObjectId(id)}
            const result= await userOrderInfoCollection.deleteOne(query)
            res.json(result)
            
        })

        // user order update
        app.put('/user/order/update/:id',async(req,res)=>{
            
            const update=req.body
            
            const id=req.params.id
            const query={_id:ObjectId(id)}
            const options={upsert:true}
            

            const updateDoc={
                $set:update
            }
            const result=await userOrderInfoCollection.updateOne(query,updateDoc,options)
            res.json(result)
            console.log(result)



        })

        

        // all user post/insert email by login
        app.post('/alluser',async(req,res)=>{
           
            const result= await allUserCollection.insertOne(req.body)
            res.json(result)
            
        })
        //   google by login
        app.put('/alluser',async(req,res)=>{
            const user=req.body
            const filter={email:user.email}
            const options={upsert:true}
            const updateDoc={$set:user};
            const result= await allUserCollection.updateOne(filter,updateDoc,options)
            res.json(result)
            
        })

        // make adimn
        app.put('/user/admin',async(req,res)=>{
            const user= req.body
            const filter={email:user.email}
            const updateDoc={
                $set:{
                    role:"admin"
                }
            }
            const result= await allUserCollection.updateOne(filter,updateDoc)
            res.json(result)
            
        })

        // check admin or not. clint part in usefirebas
        app.get('/admin/:email',async(req,res)=>{
            const email=req.params.email
            const query={email:email}
            const result=await allUserCollection.findOne(query)
            let isAdmin=false;
            if(result?.role === "admin"){
                isAdmin=true
            }
            res.send({admin:isAdmin})
        })
       

        


        // post user review
        app.post('/userReview',async(req,res)=>{
            
            const result=await userReviewCollection.insertOne(req.body)
            res.json(result)
            
        })
        // get all user review
        app.get('/userReview',async(req,res)=>{
            const cursor= userReviewCollection.find({})
            const result= await cursor.toArray()
            res.send(result)

        })

        // add a new product
        app.post('/addNweProduct',async(req,res)=>{
            const result=await cakeCollection.insertOne(req.body)
            res.json(result)
            console.log(result)
        })




    }
    finally{

    }

}
run().catch(console.dir)

