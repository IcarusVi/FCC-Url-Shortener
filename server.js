'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var validUrl = require('valid-url');

var cors = require('cors');
const shortid = require('shortid');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.DB_URI);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true });
const db = mongoose.connection;


const Schema = mongoose.Schema;

const urlSchema = new Schema({
  original_url: String,
  short_url: String
})

let URL = mongoose.model("URL", urlSchema)
/*
db.once('open', function() {
  console.log("We are open")
  let test = new URL({
    original_url: "https://www.youtube.com/",
    short_url: shortid.generate()
  })
  test.save((err, data) => {
        if (err) console.log('error');
      });
});
*/


app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.post("/api/shorturl/new", (req, res)=>{
  let url = req.body.url
  
  //If a valid URL create the short url and redirect to json
  if(validUrl.isUri(url)){
    let test = new URL({
    original_url: url,
    short_url: shortid.generate()
  })
    //save both urls to db
    test.save((err, data) => {
      if (err) console.log('error');
        res.json({
          original_url: test.original_url,
          short_url: test.short_url
        })
      });
  }
  //If url isn't valid send a JSON error
  else{
    res.json({
      error: "invalid URL"
    })
  }
  
  
  
})

app.get("/api/shorturl/:short_url?", async(req, res)=>{
  let check = req.params.short_url;
  let bugCheck = await URL.findOne({short_url: check})
  if(bugCheck !== null){
    res.redirect(bugCheck.original_url)
    console.log(bugCheck.original_url)
  }
  else{
    res.json({
      error: "Short url doesn't exist"
    })
  }
  
})



app.listen(port, function () {
  console.log('Node.js listening ...');
});