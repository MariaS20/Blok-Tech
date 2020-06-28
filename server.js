const express = require('express')
const bodyParser = require('body-parser')
const mongo = require('mongodb')
const ejs = require("ejs")
const slug = require("slug")
const port = 8000


require('dotenv').config()


//connect met de database

let db = null
const url = 'mongodb://' + process.env.DB_HOST + ':' + process.env.DB_PORT

mongo.MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
  if (err) {
    throw err
  }
  
  db = client.db(process.env.DB_NAME)
  
})

express()
  .use(express.static('static'))
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
  .use(notFound)
  .listen(8000)


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

function loginform(req, res) {
  res.render('login.ejs')
}

function form(req, res) {
  res.render('registreren.ejs')
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
        console.log('Login geslaagd'); 
        res.render('loginSucces.ejs')
      } else {
        console.log('Login mislukt');
        res.render('loginFailed.ejs')
  
      }
    }
  }
}


//dealt met not found pages
function notFound(req, res) {
  res.status(404).render('404.ejs')
}
