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
/* AWS.config.update({
  accessKeyId: 'ASIAZI4YHMLRXLUCNNUD',
  secretAccessKey: 'APOUqvv0MboNpTgxLgNbxZRaKWxYRWs0hHUH2ZHs',
  region: 'ap-southeast-2',
  sessionToken: 'IQoJb3JpZ2luX2VjEPD//////////wEaCmFwLXNvdXRoLTEiRzBFAiEAhe5TZA4T/PAk8MSKdzvuNNHwLEVWde7syRDfPzgSA2oCIBP2r25fQwKx2XT6m7zmFhKxVoZqKIRPa7IQtZxEhrt/KrcCCJn//////////wEQABoMNjM3NTg1MDIzNzE1Igyu/3lVXMjyupeluIQqiwLHx0dgRs1FPw/jFlhf2VYlF9O8xjKDkM6cIBsvC7jCxrPuph4ALMEHgT45VsgltF8mJY81EgzHGru5dquV5t+GBE14eODt8KEzJI7vJX0L/QPyrQqbIJ3QeqbBku8oBUUkHhOX/6M48pknyspehhKiA8yCWnQYW4F+mWtVo/dNCawB0e1Nth0sTHvvQ8i0/eAIurQ84z8/HuPC5MQ7M6yvkgduYWXhli/sNqEm1H6oidgPXab4zebsG+UTn5+KEmmmMFM2SaCcVYgEZ7df02R73mRR1BSDReHFF2M1xkccfYDWP0YcgDqGYrhmljWR/sOkwTzWTPxdqTzXFUtdFYlsytprOuid5A38ltkwsJOXrQY6nQEsW0Y28kj0O/y45XqY2mbCRzSWpHJRZEYdeUtmlR4vWBtcKoBnW2uFKuGa1w5OBuSl6f4wsJKUl+F484ygv3nF1NQb+5FoaJoIh8lKaSR1Cbko9aPIZiLOKucsKKGD9rBiBv0LPSx7N8fhslRdXYgHBqjqblTJCSx/f7Vjhe7EicIxFS9H/XIme+l7jSAQnlwsV5OxmJoK2/QgCY+O'
});
 */
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



  app.get('/api/images/getlisteverything', async (req, res) => {
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