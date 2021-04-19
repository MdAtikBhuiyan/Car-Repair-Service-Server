const express = require('express')
const app = express()
const cors = require('cors');
const ObjectID = require('mongodb').ObjectID;
const MongoClient = require('mongodb').MongoClient;

require('dotenv').config();
const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2gxdt.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello World!');
})


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    console.log('database connected successfully');
    const serviceCollection = client.db("carRepairDB").collection("services");
    const adminCollection = client.db("carRepairDB").collection("admin");
    const reviewCollection = client.db("carRepairDB").collection("reviews");
    const bookedCollection = client.db("carRepairDB").collection("bookList");

    // add services
    app.post('/services', (req, res) => {
        const service = req.body;
        console.log(service);
        serviceCollection.insertOne(service)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    // Show Service
    app.get('/showServices', (req, res) => {
        serviceCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    // delete product
    app.delete('/deleteService/:id', (req, res) => {
        const id = ObjectID(req.params.id)
        serviceCollection?.deleteOne({
            _id: id
        })
            .then(result => {
                res.send(result.deletedCount > 0)
            })
    })

    // make admin
    app.post('/makeAdmin', (req, res) => {
        const adminInfo = req.body;
        adminCollection.insertOne(adminInfo)
            .then(result => {
                console.log(result.insertedCount);
                res.send(result.insertedCount > 0)
            })
    })

    // add review
    app.post('/addReview', (req, res) => {
        const review = req.body;
        reviewCollection.insertOne(review)
            .then(result => {
                console.log(result.insertedCount);
                res.send(result.insertedCount > 0)
            })
    })

    // show review
    app.get('/showReview', (req, res) => {
        reviewCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    // load single service for book
    app.get('/book/:id', (req, res) => {
        const id = ObjectID(req.params.id)

        serviceCollection.find({ _id: id })
            .toArray((err, documents) => {
                res.send(documents[0])
            })
    })

    // book service
    app.post('/bookService', (req, res) => {
        const bookData = req.body;
        bookedCollection.insertOne(bookData)
            .then(result => {
                console.log(result.insertedCount);
                res.send(result.insertedCount > 0)
            })
    })

    // show book and order list

    app.post('/showBookList', (req, res) => {
        const email = req.body.email;
        console.log(" list email", email);
        adminCollection.find({ email: email })
            .toArray((err, admin) => {
                const filter = {};
                if (admin.length === 0) {
                    filter.email = email
                }
                bookedCollection.find(filter)
                    .toArray((err, documents) => {
                        res.send(documents)
                    })
            })
    })

    // 

     // is admin or not
     app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminCollection.find({ email: email })
            .toArray((err, admin) => {
                res.send(admin.length > 0)
            })
    })

    // update status

    // app.post('/updateStatus',(req,res) => {
    //     const id = ObjectID(req.body.updateId);
    //     const status = req.body.status;
    //     console.log("Update",id,status);
    //     bookedCollection.updateOne({_id:id}, {$set: {status:status} })
    //     .then( result => {
    //         console.log(result);
    //         res.send(result.modifiedCount > 0)
    //         // res.redirect('/')
    //     })

    app.patch('/updateStatus',(req,res) => {

        const serviceId = ObjectID(req.body.updateId);
        const status = req.body.status;
        console.log("Update",serviceId,status);
        bookedCollection.updateOne({_id: serviceId},
        {
            $set: {status:status},
            $currentDate:{'lastModified':true}
        })
        // (err,result) => {
        //     if(err){
        //         console.log('err');
        //     }
        //     else{
        //          console.log('modifiedCount',result.modifiedCount);
        //     }
        // })
        .then( result => {
            console.log(result);
            // console.log(modifiedCount);
            res.send(result.modifiedCount > 0)
        })
        .catch(err => console.log('err',err))
        
    })


});

app.listen(port)