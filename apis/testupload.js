//THIS DOESNT WORK IN PROD. REPLACED WITH SAVETOJWS.JS
//This is a different method to save the file. This just writes the file to the server
//need to test if this works in the prod enviornment first

//TODO THIS DOESNT WORK IN PROD. No direct access to the file system on the server
//Need to write the file to an S3 bucket. See this page for an example
//https://app.cyclic.sh/#/app/ffarquar-nodeapiforbikes/data


//check this package out that may make using s3 easier
//https://github.com/cyclic-software/s3fs

const express = require("express");
const bodyParser = require("body-parser");
const app = express()

var multer = require('multer');
var path = require('path')

//const port = 3000

//app.listen(port, () => console.log(`Server started on port ${port}`))

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "./uploads"), // cb -> callback
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  });
var upload = multer({ storage: storage });

const handleMultipartData = multer({
    storage,
    limits: { fileSize: 1000000 * 5 },
  }).single("file");

module.exports = function(app){
  app.post('/api/images/upload4', async (req, res) => {

    console.log("In handler");
    handleMultipartData(req, res, async (err) => {
      if (err) {
        res.json({ msgs: err.message });
      }
  
      res.json({
        body: req.body,
        file: req.file,
      });
    });
  })


  }
