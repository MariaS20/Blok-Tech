/* eslint-disable semi */

var express = require('express')
var bodyParser = require('body-parser')
//var multer = require('multer')
var mongo = require('mongodb')

require('dotenv').config()

var db = null
var url = 'mongodb://' + process.env.DB_HOST + ':' + process.env.DB_PORT

mongo.MongoClient.connect(url, function (err, client) {
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
  .get('/add', form)
  .get('/login', loginform)
  .get('/:id', user)
  .delete('/:id', remove)
  .use(notFound)
  .listen(8000)

function gebruikers(req, res, next) {
  db.collection('user').find().toArray(done)

  function done(err, data) {
    if (err) {
      next(err)
    } else {
      res.render('list.ejs', {data: data})
    }
  }
}

function user(req, res, next) {
  var id = req.params.id

  db.collection('user').findOne({
    _id: new mongo.ObjectID(id)
  }, done)

  function done(err, data) {
    if (err) {
      next(err)
    } else {
      res.render('detail.ejs', {data: data})
    }
  }
}

function form(req, res) {
  res.render('add.ejs')
}

function loginform(req, res) {
  res.render('login.ejs')
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

function checklogin(req, res, next) {
  db.collection('user').findOne({naam:req.body.naam}, done) 

  function done(err, data) {
    if (err) {
      next(err)
    } else {
      if (data.wachtwoord == req.body.wachtwoord) {
        console.log('Login geslaagd');
        //res.redirect('/loginsuccess') 
      } else {
        console.log('Login mislukt');
        //res.redirect('/loginfailed')
  
      }
    }
  }
}

function remove(req, res, next) {
  var id = req.params.id

  db.collection('user').deleteOne({
    _id: new mongo.ObjectID(id)
  }, done)

  function done(err) {
    if (err) {
      next(err)
    } else {
      res.json({status: 'ok'})
    }
  }
}

function notFound(req, res) {
  res.status(404).render('not-found.ejs')
}
