//This is an evolution of test_Aws_Session_Tok.js. Trying to expand the functionality

const express = require("express");
const bodyParser = require("body-parser");
const app = express()

const AWS = require('aws-sdk');

//The AWS details came from the Data tab on the Cyclic website. In prod, these are taken from the server, no need to change anything
/* AWS.config.update({
  accessKeyId: 'ASIAZI4YHMLRWNTN36IM',
  secretAccessKey: 'CB9Sb0urWorgCPbLlGlD/m6oBK04vFJ58pP/1+5X',
  region: 'ap-southeast-2',
  sessionToken: 'IQoJb3JpZ2luX2VjEPH//////////wEaCmFwLXNvdXRoLTEiRjBEAiA2CR+4v48OUoPaY5mDQ4RvbalW//5mZbQX/feZcKxOOQIgF5wzdHF1nKDSbhegXjSZ7zEktnMesef0zwcmvIH4CrwqtwIImv//////////ARAAGgw2Mzc1ODUwMjM3MTUiDLlG8ZNtSBuvwB6pMyqLAusJytwph58IxXSNVZ3+MBlvTKhVcMZCgOU4KQDU0OfubQBz1ro85eHnPEwTkC12CpNpmmJ8FiJ3kJOI2JF0baDnokrBRy8+dDkU9EWrHDdoXr6gsvmK1UEQ6qgqsyNtsZNI+h5U7c1QodjYyaSQkj5DdcQlE9To9z/DXm2yRsiBJEPzrecPmXslO6bYp1+B7jFB7rsCnU6iBnSjIyIKM6HTqguu2a88zx2gsEvUGPiM/2KHYXSbxMM+rMPJ9RAl4gb5uDlvt9OcShA2/k5bGWg2El47FeE2JjeboVCFhimzfqSROPMishslShvRtgKe2FpB3QF13hmjhUioPflPbct/iBDAhrFfDDNK3DD6r5etBjqeAafCuO3sX+5ifHW76Mut0Zn3qzHnu2lvG/NcxnyhU0jd6EE/LFcJ/FbSP11x5X7RsS5KmPC5JqLF5p6Bxohi6upI13JBJ4ErgZC77NcgnU0swPcyxc7mJG8wxPrjXjOkNJcuGITeZylP7Rz/YebPm8rJOwt3bYDbDF6i0T7QFPAX/ldA8YeoW0SK8aYrWJXG9z9E3p7SaZkHrfMCH8n6'
}); */

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
    //let myFile = req.file.originalname
    //let path = req.body.directoryupper  + "/" + req.body.directorylower  //easier then I thought to access the values set in the form-data key
    //console.log("Path = " + path)
    //console.log("Filename = " + myFile)
    const params = {
      Bucket: 'cyclic-graceful-deer-fedora-ap-southeast-2',
      Key: `${req.body.directoryupper}/${req.body.directorylower}/${req.file.originalname}`,
      Body: req.file.buffer,
    };
  
/*     s3.putObject(params, (error, data) => {
      if(error) {
          res.status(500).send(error)        
      }

      res.status(200).send(data)

    }) */
    s3.upload(params, (error, data) => {
      if(error) {
          res.status(500).send(error)        
      }

      res.status(200).send(data)

    })

  });

  app.get('/api/images/getfilesinfolder/:upperfolder/:lowerfolder', async (req, res) => {
    console.log("In getfilesinfolder")
    let upperfolder = req.params.upperfolder
    let lowerfolder = req.params.lowerfolder
    //console.log("Upper folder " + upperfolder)
    const params = {
      Bucket: 'cyclic-graceful-deer-fedora-ap-southeast-2',
      Prefix: `${upperfolder}/${lowerfolder}`    //The prefix doesent work when going down another level, like 2~3 even with delimter
    };
  
    console.log("Params " + params.Prefix)

    const data = await s3.listObjectsV2(params).promise();

    var out=[];
    for(obj of data.Contents){
      console.log(obj.Key)
        out.push(obj.Key);
    }
    res.send(out)
/*     var resultsToReturn = [];
    for (let index = 1; index < data['Contents'].length; index++) {
        console.log(data['Contents'][index]['Key'])        
        
        const obj = {"Key": data['Contents'][index]['Key']}

        resultsToReturn.push(obj)
    } 
    res.send(resultsToReturn)
    */    
   });

  app.get('/api/images/getlisteverything', async (req, res) => {
    console.log("In get")        
    console.log("")   
    console.log("")   
/*     const params = {
      Bucket: 'cyclic-graceful-deer-fedora-ap-southeast-2',
      Prefix: '2'   //The prefix doesent work when going down another level, like 2~3 even with delimter
    };
 */
    const params = {
      Bucket: 'cyclic-graceful-deer-fedora-ap-southeast-2'

    };

    const data = await s3.listObjectsV2(params).promise();

    var out=[];
    for(obj of data.Contents){
      const obj1 = {"Key": obj.Key}
      console.log(obj.Key)
        //out.push(obj.Key);
        out.push(obj1)
    }
    res.send(out)

   });

  app.delete('/api/images/delete/:directoryupper/:directorylower/:filename', async (req, res) => {
    console.log("In delete")      
    
    var deleteParam = {
      Bucket: 'cyclic-graceful-deer-fedora-ap-southeast-2',
      Key: `${req.params.directoryupper}/${req.params.directorylower}/${req.params.filename}`

    };    

    console.log("File to delete = " + deleteParam.Key)

    s3.deleteObject(deleteParam, function(err, data) {
      if (err) {
        console.error(err);
        return res.status(500).send('Error deleting file');
      }

      res.status(200);
      res.send('File deleted successfully ');
    });

   });   

  app.get('/api/images/getafile/:directoryupper/:directorylower/:filename', async (req, res) => {
    console.log("In get")      
    
    var param = {
      Bucket: 'cyclic-graceful-deer-fedora-ap-southeast-2',
      Key: `${req.params.directoryupper}/${req.params.directorylower}/${req.params.filename}`
    };    

    s3.getObject(param, function(err, data) {
      if (err) {
        console.error(err);
        return res.status(500).send('Error getting file ' + param.Key + ". " + err.message);
      }

      res.status(200);
      res.attachment(param.Key); // Set Filename
      res.type(data.ContentType); // Set FileType
      res.send(data.Body);        // Send File Buffer
    });

   });   

}