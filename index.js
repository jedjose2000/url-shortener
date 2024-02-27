require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
mongoose = require('mongoose');
let bodyParser = require('body-parser');
const dns = require('node:dns');
let uri = 'mongodb+srv://jedjose2000:hyPhvDwFltCj0Wkb@cluster0.cf7vwhh.mongodb.net/db_freeCodeCamp?retryWrites=true&w=majority'

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });


let urlSchema = new mongoose.Schema({
  original_url: { type: String, required: true, unique: true },
  short_url: { type: Number, required: true, unique: true }
})

let urlModel = mongoose.model('urlModel', urlSchema)

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/", bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


app.get('/api/shorturl/:url', function(req, res) {
  let url = req.params.url;
  console.log('hello');
  urlModel.find({ short_url: url })
  .exec()
  .then(data => {
    if (data.length === 0) {
      res.json({ error: 'No short URL found for the given input' });
    } else {
      let original = data[0].original_url
      res.redirect(original);
    }
  })
  .catch(err => {
    res.json({ error: 'An error occurred while searching for the URL' });
  });
});



app.post('/api/shorturl', function(req, res) {
  let url = req.body.url
  try {
    newUrl = new URL(url);
    let original_url = newUrl.href;
    let newShortUrl = 0;
    dns.lookup(newUrl.hostname, (err, address, family) => {
      if (!address) {
        res.json({ error: 'Invalid Hostname' });
      } else {  
        urlModel.find()
        .sort({ short_url: -1 })
        .limit(1)
        .then(data => {
          if (data.length === 0) {
            newShortUrl = 1
          } else {
            newShortUrl = data[0].short_url + 1
          }
          urlModel.find({original_url:original_url})
          .limit(1)
          .then(data => {
            if (data.length === 0) {
              let dbUrl = new urlModel({original_url:original_url ,short_url:newShortUrl})
              dbUrl.save();
              res.json({ original_url: original_url, short_url: newShortUrl });
            } else {
              res.json({ original_url:  data[0].original_url, short_url:  data[0].short_url });
            }
          })
        })
      }
    })
  } catch (err) {
    res.json({ error: 'invalid url' });
  }
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
