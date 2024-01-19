//This is an evolution of test_Aws_Session_Tok.js. Trying to expand the functionality

var express = require("express");
    AWS = require('aws-sdk');
    bodyParser = require("body-parser");
    multer = require('multer');
    multerS3 = require('multer-s3');

//The AWS details came from the Data tab on the Cyclic website. In prod, these are taken from the server, no need to change anything.
//It seems this has to be removed prior to going to prod.
/* AWS.config.update({
  accessKeyId: 'ASIAZI4YHMLR7PCNF2XX',
  secretAccessKey: 'qwsqkn3f8D7M2a4iDntHibjV8wJBCTA955cZ2Ez2',
  region: 'ap-southeast-2',
  sessionToken: 'IQoJb3JpZ2luX2VjEDgaCmFwLXNvdXRoLTEiSDBGAiEA+Esd+2joc5T12puJNOXlTEC8CDBtrENuch5L4Ldd9zACIQDOByO7O6BqQkBFuLYnLpoxg3R/IE2DQ/bYxD5em6yrfyq3Agji//////////8BEAAaDDYzNzU4NTAyMzcxNSIMqS9oTBzlZWZdTVQ8KosC5qIyHAQrjxTt4hrpqZkcIDYiSUMD5+uHAYZnME0JpPghSokR2uVA5JNsQnEMbx9+ZLZkVT2Hiit4n3JSlvuvHjiWZTQ2WBQB5vVpWIzAud9FFNRHUoF8AyVhDD5sFmGwo1FtDmgojXn0DlpR5JWrBEo5wF8QC4l+LMWH/6f71kTbyaupo89Oo5pOacUNe2PaNOzYileVh7iAqmTO+N0beF1XcrUfyBxwUcSRtNdos+YqiZRSSzN9ywpp3KSK4yaqIJ0L/wh8wCg13wycN6fG8LrG2u1ebPmq/kFxVSqV07nKmrkHSQTrT9Oj8EPXT1MKYSmLTvuqYFNd27s+qvt3lL5a1sSbNPDGea7IMOKEp60GOpwBOonrCCtzYlOJ6RIMdesrQSfSoslVx4vlfvKzOvji5W8PWW/TtJ1EXl1IuXr03DDRyS1fOqpV7w+OmsPAz8BJzLwQ6uovFfvienXUCRL4bYSy+Cj6viEueXpiHGPSl0o8NKXtnQbmI2QyIGPDgkBzCpgCc3h3L9K6w44KSOHkGITE+7JJNpCK0IHF+GrPWDum2Tw67iri3xNPvG1k'
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