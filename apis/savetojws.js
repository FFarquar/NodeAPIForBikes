//This is an attempt to save files to AWS. This ability is provided by cyclic. Perhaps the data could be stored in that locale too
//Using this example https://abbaslanbay.medium.com/uploading-files-to-aws-s3-with-multer-and-the-node-js-aws-sdk-7cad8dc87fc2

//REMOVE THIS FILE. IT DOESNT WORK LOCALLY

//This works in prod but not in dev. In dev, I get a message about the accesskeyid not being recognized.
const express = require("express");
const bodyParser = require("body-parser");
const app = express()

const AWS = require('aws-sdk');

/* //The AWS details came from the Data tab on the Cyclic website
AWS.config.update({
  accessKeyId: 'ASIAZI4YHMLRQJDSICF6',
  secretAccessKey: 'OrHN+TxPRoZkIl+VPGkHzPAWK2J5q+lHc91hF7fH',
  region: 'ap-southeast-2',
}); */

const s3 = new AWS.S3();

const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // limit file size to 5MB
  },
});

module.exports = function(app){
app.post('/api/images/upload', upload.single('file'), (req, res) => {
    const params = {
      Bucket: 'cyclic-graceful-deer-fedora-ap-southeast-2',
      Key: req.file.originalname,
      Body: req.file.buffer,
    };
  
    s3.putObject(params, (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error uploading file');
      }
  
      res.send('File uploaded successfully');
    });
  });
}