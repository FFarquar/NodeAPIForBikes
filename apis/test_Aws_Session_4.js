//This is an evolution of test_Aws_Session_Tok.js. Trying to expand the functionality

var express = require("express");
    AWS = require('aws-sdk');
    bodyParser = require("body-parser");
    multer = require('multer');
    multerS3 = require('multer-s3');

//The AWS details came from the Data tab on the Cyclic website. In prod, these are taken from the server, no need to change anything.
//It seems this has to be removed prior to going to prod.
/* AWS.config.update({
  accessKeyId: 'ASIAZI4YHMLRX5GHBP7Q',
  secretAccessKey: 'ylYIcXKiVLuYpv3iKp/0JEk75emC3+msI8aFy2sW',
  region: 'ap-southeast-2',
  sessionToken: 'IQoJb3JpZ2luX2VjECcaCmFwLXNvdXRoLTEiRjBEAiAMl6DploPy8VBzLV6fNCynEdACGinWSv4otcH8pzDD9wIgK4ik+qSugryQW8lJvSPLDO+YKeGu1GAglE4Ekvc8toMqtwII0P//////////ARAAGgw2Mzc1ODUwMjM3MTUiDDJ9WleK5dfVW3AjfyqLApb7stRbZ4uw4lECJpfT8WlZ+g9k40GWse2+WGKX1u4t7xbay1z3hg2gSCjooIBrGf5uUsqX+/zhXbdKtcW3RF9XVK/Kg1VQ9HF9uqiDMkKipr+H9dommgz+CGzbfj7BDROtKOZWVkIpLWrWQjF2YSm/uEEPaKopWdDIWvUNlII9yXd5sE9WysLJnhNfvAoYIvjVGcZ2Xl10cNxiXxqL0npV2gF/h78kdHoK2zAkPCGIzbgJRi3HA6CCNJxZHluNTFXtpocC2ThfbA4lxPBaklJjp3Sdp+x7ntrENJQWvWchULVq2CEOoimbpHE6NFxLDyOGPG1vLSCPSwHFkrj8P04fp61G6tq+KO1SeTCQnKOtBjqeAUUAW3Dec80rzWgQSeuGDejsqhvifSo/UjZGLV5tMF/7XRtYoMyjGEyn9uhJHaQnCD2FT9SIWWdIdbCH+Jm3sf/Z1zZUBqkjO9tijpncGwlBdn8kXhUl6Jul0OBT19YSAH93zKJrA3ONOCWmazF/xi81XGhQsxzCgV+BLjElc8VEOvRktJ7szyJ4yOvLj0LTC1OORUqaMrygcUs+ofvC'
}); */

var app = express()
    s3 = new AWS.S3();

app.use(bodyParser.json());

var upload = multer({
  storage: multerS3({
      s3: s3,
      bucket: 'cyclic-graceful-deer-fedora-ap-southeast-2',
      key: function (req, file, cb) {
          //console.log(file);
          cb(null, `${req.body.directoryupper}/${req.body.directorylower}/${file.originalname}`); //use Date.now() for unique file keys
      }
  })
});

module.exports = function(app){

  //this example uses multi part with the directory set in the form-data
  app.post('/api/images/upload', upload.array('file',10), (req, res) => {
    //console.log(req.file)

    res.send({
      UploadResults: req.files.map(function(file) {
          return {Uploaded:'true', FileName: file.originalname, StoredFileName: file.location, ServerPath:`${req.body.directoryupper}/${req.body.directorylower}/`, MimeType: file.mimetype, Size: file.size, ErrorCode:0};
      })
    });

  });

  app.get('/api/images/getfilesinfolder/:upperfolder/:lowerfolder', async (req, res) => {
    console.log("In getfilesinfolder")
    let upperfolder = req.params.upperfolder
    let lowerfolder = req.params.lowerfolder
  
    const params = {
      Bucket: 'cyclic-graceful-deer-fedora-ap-southeast-2',
      Prefix: `${upperfolder}/${lowerfolder}`    
    };
  
    //console.log("Params " + params.Prefix)

    const data = await s3.listObjectsV2(params).promise();

    var out=[];
    for(obj of data.Contents){
      console.log(obj.Key)
        out.push(obj.Key);
    }
    res.send(out)
 
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

    //deleteParam.Key = "Dido.jpg"
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