//This is an evolution of test_Aws_Session_Tok.js. Trying to expand the functionality

const express = require("express");
const bodyParser = require("body-parser");
const app = express()

const AWS = require('aws-sdk');

//The AWS details came from the Data tab on the Cyclic website. In prod, these are taken from the server, no need to change anything.
//It seems this has to be removed prior to going to prod.
AWS.config.update({
  accessKeyId: 'ASIAZI4YHMLR232WL4FF',
  secretAccessKey: 'QtxsQwIvrNIW4cxSnEbHiADXKa6LERarC+8YplB6',
  region: 'ap-southeast-2',
  sessionToken: 'IQoJb3JpZ2luX2VjEPX//////////wEaCmFwLXNvdXRoLTEiRzBFAiBj3hthz82tMwYRdHB+rmmMdWYr3nPmN9KZs51o243zqQIhAMNKJpBvyu05qD1UDdau9eDAxmCBTyOPsN84FDsJB4LmKrcCCJ7//////////wEQABoMNjM3NTg1MDIzNzE1Igz0hzC0pT1XmEVkc4gqiwJGv0VcK6CxxifB4anlosiNzd2p6H4Db2g3AFiggG08xk/XTfcpWYjQsBHzgoNqJXV9QgJ+hUsPZrFxMdrF5XxCzof5fThmB1wqWyU4AQ6jTX62PTlwaDOOnzNUoIZhua7osRW/16oBKi34+vOhSH4CjgF0Rr1mNUD/jzvB3GQdnsHPeIh0IL2RJJEOcb4t4kuU2A6DTE/Ge0jfC/OhIXme9fgJH5ReASUX+osoXVv/YYzFkSQV1BSlYtKp+an+Da81OW23/92tAUijLYRJxqMnhweObYeeTqXExAac4ntTe/7TUFI1XPukmIQN/YCDDeBa2twwEm31AbAMCBDhE1/4+yj9zBaFbWbTId8whaOYrQY6nQFfWFjp54qkT45xctJeCaDbzg7fv8s1cYe/uDEGAjK6gEWC92st7eTebowzVZ5nJ4I33rK9k3eIXlre4Cub0MZYRXdBMoeJrWsEoS+ZvakVHOH5MiYJQt+k7hEuoL5LKOxc5FLOsfIUSDmTkrwUXZbRQa2YPCNDLXCYU14swka1xzw4fEBxZBiXg+z9ppHdYO7uEUsf8z8CcD0w+SPa'
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