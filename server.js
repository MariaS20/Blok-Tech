// test
const express = require('express')
const app = express()
const ejs = require("ejs")
const slug = require("slug")
const bodyParser = require('body-parser')
const port = 8000

app.use(express.static('public'))

app.get( "*", (req, res) => {
    res.send("Error! 404 this route doesn't exist");
} );

var http = require('http')

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example is app listening on port ${port}!`))



