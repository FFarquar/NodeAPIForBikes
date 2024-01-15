//This is an attempt to save files to AWS. This ability is provided by cyclic. Perhaps the data could be stored in that locale too
//Using this example https://abbaslanbay.medium.com/uploading-files-to-aws-s3-with-multer-and-the-node-js-aws-sdk-7cad8dc87fc2

//USing the code developed in savetojws.js and adding session token

//Adding session token allowed this to work in TEST YAH

//Trying in prod now. This worked too. Hip hip horray

const express = require("express");
const bodyParser = require("body-parser");
const app = express()

const AWS = require('aws-sdk');

//The AWS details came from the Data tab on the Cyclic website. In prod, these are taken from the server, no need to change anything
AWS.config.update({
  accessKeyId: 'ASIAZI4YHMLRZPFLM2TN',
  secretAccessKey: '7LjPvWLioTzcU2qr+n0L8Vi88Kux5d3BLKZtyTrU',
  region: 'ap-southeast-2',
  sessionToken: 'IQoJb3JpZ2luX2VjEN///////////wEaCmFwLXNvdXRoLTEiRzBFAiAD0Vd2QjAFrFlcqKTz8TF9MNXgp0CxTQcIGzfD8iWkLQIhAJl7lvRQdHnDF+uDCOKzaKeNLxXVRkMDbUNnOsSq9vl/KrcCCIj//////////wEQABoMNjM3NTg1MDIzNzE1IgyGlW/l+Esig3gDIJ0qiwK9DoC/ZzGaTHehsWNUUSsdAAZRhoCcccnRbfPMhzGIBjiFcP0SXfuZUcVLeH/28Q4M0JiXhtZ84kW/o5S8yIkh5qgdoyCB/hYX2B75aW6YkSRdtXLiOFNBbNyCVeMJqYUnIEVKY8Zdm5W1236DG/X0VYKrCxBn5Pk2zFrUPxED9hENluTqsPkoh5r0bsoz+PQ13YxVu4pH1D3i8eEvMDutaVS02koDjmH0uRhXRUpJdUYcInJ00lPaPaDU3roDUrzg8OnRiM1+m/iOTUDSVnwa4VDhcKe0RFdzJORgK2qtS3pTDS31iEsToNZEEKi4GangeB/gFk1MtRL77zRtuu9Zmu0LRC57HAibtdAw7aOTrQY6nQGrR1Vu7kl3LgsRB9MxzZJldF2/+ymQW1N40GadJ4ve7PLZaDYs26ZIdp9sUdGyB3hEXcyY0qAYfRtCS/WNwdbMewDGV8obGgevfpTZGpBdbl6y5Pl6K1hbWJoql7Sjazo2zWKCL+q25PCb1XQlcGQUqJGHF0+l+gJFPG5sJgAioz3Z1Jpr+trhQJRouFWFUwowF9W1P1O+k2phROIO'
});

const s3 = new AWS.S3();

const multer = require('multer');

//this implementation of multer works without issue, but no control over the file name
/* 
const upload = multer(
  {
  storage: multer.memoryStorage(),
  limits: {fileSize: 5 * 1024 * 1024  }, // limit file size to 5MB
  }
); */

const storage = multer.memoryStorage({
  destination: (req, file, callback) => {
      callback(null, "")
  }
})
const upload = multer({storage}).single("file");
 


module.exports = function(app){

  //this example uses multi part with the directory set in the form-data
  app.post('/api/images/upload', upload, (req, res) => {
    console.log("In directory post")
    let myFile = req.file.originalname
    let path = req.body.directory   //easier then I thought to access the values set in the form-data key
    //console.log("Path = " + path)
    //console.log("Filename = " + myFile)
    const params = {
      Bucket: 'cyclic-graceful-deer-fedora-ap-southeast-2',
      Key: `${path}~${myFile}`,
      Body: req.file.buffer,
    };
  
    s3.upload(params, (error, data) => {
      if(error) {
          res.status(500).send(error)        
      }

      res.status(200).send(data)

    })

  });

  app.get('/api/images/getlist', async (req, res) => {
    console.log("In get")        
    console.log("")   
    console.log("")   
    const params = {
      Bucket: 'cyclic-graceful-deer-fedora-ap-southeast-2',
      Prefix: '2'   //The prefix doesent work when going down another level, like 2~3 even with delimter
    };
  
    const data = await s3.listObjectsV2(params).promise();


    var resultsToReturn = [];
    for (let index = 1; index < data['Contents'].length; index++) {
        console.log(data['Contents'][index]['Key'])        
        
        const obj = {"Key": data['Contents'][index]['Key']}

        resultsToReturn.push(obj)
    }    


    res.send(resultsToReturn)
   });

   //Cant use backslashes in the path. Use ~ tilde instead of slashes, eg 2_3_Revenge.jpg
  app.delete('/api/images/delete/:fullname', async (req, res) => {
    console.log("In delete")      
    
    let myFile = req.params.fullname

    //myFile = '2~4_L_M class DD.jpg'
    console.log("myFile = " + myFile)
    var deleteParam = {
      Bucket: 'cyclic-graceful-deer-fedora-ap-southeast-2',
      Key: myFile
    };    

    s3.deleteObject(deleteParam, function(err, data) {
      if (err) {
        console.error(err);
        return res.status(500).send('Error deleting file');
      }

      res.status(200);
      res.send('File deleted successfully ');
    });

   });
}