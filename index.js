const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const admin = require('firebase-admin');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
console.log(process.env.DB_PASS);


;



const app = express()
app.use(cors());
app.use(bodyParser.json())




var serviceAccount = require("./configs/burj-al-arab-36bce-firebase-adminsdk-d708b-4ef3c6e01c.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:process.env.FIRE_DB,
})

  const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.huwqv.mongodb.net/burjAlArab?retryWrites=true&w=majority`

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true});
client.connect(err => {
  const bookingsCollection = client.db("burjAlArab").collection("bookings");
 app.post('/addBooking',(req,res)=>{
   const newBooking = req.body
   bookingsCollection.insertOne(newBooking)
   .then(result=>{
     res.send(result.insertedCount > 0);
   })
   console.log(newBooking);
 })

 app.get('/bookings',(req, res)=>{
  const bearer = req.headers.authorization
  if (bearer && bearer.startsWith('Bearer ')) {
    const idToken = bearer.split(' ')[1];
    // console.log(idToken);
    admin.auth().verifyIdToken(idToken)
    .then(function(decodedToken) {
      let tokenEmail = decodedToken.email;
      if (tokenEmail == req.query.email) {
        bookingsCollection.find({email: req.query.email})
        .toArray((err,documents)=>{
          res.send(documents)
        })
      }
      else{
        res.status(401).send('un-authorization')
      }
    }).catch(function(error) {
      res.status(401).send('un-authorization')
    });
  }
else{
  res.status(401).send('un-authorization')
}



})
});


app.get('/', function (req, res) {
  res.send('hello world')
})

app.listen(5000)