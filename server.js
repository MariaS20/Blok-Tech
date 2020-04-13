const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mongo = require('mongodb')
const ejs = require('ejs')
const slug = require('slug')
const port = 8000


require('dotenv').config()


//connect met de database
let db = null
let collection;
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://" + process.env.DB_USER + ":" + process.env.DB_PASS + "@blok-tech-ezc4c.mongodb.net/test?retryWrites=true&w=majority"
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})


client.connect(function (err, client) {
  if (err) {
    throw err
  }

  collection = client.db("blok-tech").collection("sendChoice");
})


app
  .use(express.static('static'))
  .use(express.static('public'))
  .use(bodyParser.urlencoded({extended: true}))
  .set('view engine', 'ejs')
  .set('views', 'view')
  .get('/', gebruikers)
  .post('/', add)
  .post('/login', checklogin)
  .get('/registreren', form)
  .get('/login', loginform)
  // .get('/:id', user)
  .get('/loginFailed', checklogin)
  .get('/loginSucces', checklogin)
  .post('/sendChoice', sendChoice)
  .get('/choice', choice)
  .get('/answers', answers)
  .post('/updateAnswer', updateAnswer)
  .use(notFound)
  

 

//vind de db die wordt gebruikt
function gebruikers(req, res, next) {
  db.collection('user').find().toArray(done)

  function done(err, data) {
    if (err) {
      next(err)
    } else {
      res.render('login.ejs', {data: data})
    }
  }
}

// function user(req, res, next) {
//   const id = req.params.id

//   db.collection('user').findOne({
//     _id: new mongo.ObjectID(id)
//   }, done)

//   function done(err, data) {
//     if (err) {
//       next(err)
//     } else {
//       res.render('detail.ejs', {data: data})
//     }
//   }
// }


 //Data voor de form
 const formData = {
  id: '', //lege id om een id in op te slaan
  imageSet1: [{ imageUrl: 'images/burrito.jpg', name:'burrito', selected: false },
  { imageUrl: 'images/tacos.jpg', name:'tacos', selected: false }],

  imageSet2: [{ imageUrl: 'images/burger.jpg', name:'burger', selected: false },
  { imageUrl: 'images/hot-dog.jpg', name:'hot-dog', selected: false}],

  imageSet3: [{ imageUrl: 'images/pasta.jpg', name:'pasta', selected: false },
  { imageUrl: 'images/pizza.jpg', name:'pizza', selected: false }]
}


function choice(req, res)  {
  res.render('choice.ejs', {formData})
}

function answers(req, res) {
  res.render('answers.ejs', {formData})

}

function loginform(req, res) {
  res.render('login.ejs')
}

function form(req, res) {
  res.render('registreren.ejs')
}


//functie om de al eerder opgeslagen antwoorden te veranderen
function updateAnswer(req, res) {
  let form = req.body;

  //Update de interests maar haal de Id uit de formData
  collection.findOneAndUpdate(
    { _id: formData.id },
    { 
      $set: {
        Interest1: form.food1,
        Interest2: form.food2,
        Interest3: form.food3 
      }
    }, done)

    function done(err, data) {
      if (err) {
        return
      } else {
        resetSelectedImages();
        formData.imageSet1.find(x => x.name === form.food1).selected = true;
        formData.imageSet2.find(x => x.name === form.food2).selected = true;
        formData.imageSet3.find(x => x.name === form.food3).selected = true;
        res.redirect('/answers');
      }
    }
}

//reset alle images en zet selected op false
function resetSelectedImages() {
  for(i = 0; i < formData.imageSet1.length; i++) {
    formData.imageSet1[i].selected = false;
  }
  for(i = 0; i < formData.imageSet2.length; i++) {
    formData.imageSet2[i].selected = false;
  }
  for(i = 0; i < formData.imageSet3.length; i++) {
    formData.imageSet3[i].selected = false;
  }
}

function sendChoice(req, res, next) {
  let form = req.body;

  collection.insertOne({
    Interest1: form.food1,
    Interest2: form.food2,
    Interest3: form.food3
  }, done)

  function done(err, data) {
    if (err) {
      next(err)
    } else {
      formData.id = data.insertedId;
      formData.imageSet1.find(x => x.name === form.food1).selected = true;
      formData.imageSet2.find(x => x.name === form.food2).selected = true;
      formData.imageSet3.find(x => x.name === form.food3).selected = true;
      res.redirect('/answers');
    }
  }
}

function add(req, res, next) {
  db.collection('user').insertOne({
    naam: req.body.naam,
    email: req.body.email,
    wachtwoord: req.body.wachtwoord
  }, done)

  function done(err, data) {
    if (err) {
      next(err)
    } else {
      res.redirect('/')
    }
  }
}

//checkt de ingegeven username en het wachtwoord met die uit de database 
function checklogin(req, res, next) {
  db.collection('user').findOne({naam:req.body.naam}, done) 


  function done(err, data) {
    if (err) {
      next(err)
    } else {
      if (data.wachtwoord == req.body.wachtwoord) {
        console.log('Login geslaagd')
        res.render('loginSucces.ejs')
      } else {
        console.log('Login mislukt')
        res.render('loginFailed.ejs')
  
      }
    }
  }
}



//dealt met not found pages
function notFound(req, res) {
  res.status(404).render('404.ejs')
}

app.listen(port, () => console.log(`app running on port: ${port}`));
