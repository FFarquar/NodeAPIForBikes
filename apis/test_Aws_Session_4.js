//This is an evolution of test_Aws_Session_Tok.js. Trying to expand the functionality

var express = require("express");
    AWS = require('aws-sdk');
    bodyParser = require("body-parser");
    multer = require('multer');
    multerS3 = require('multer-s3');

//The AWS details came from the Data tab on the Cyclic website. In prod, these are taken from the server, no need to change anything.
//It seems this has to be removed prior to going to prod.
/* AWS.config.update({
  accessKeyId: 'ASIAZI4YHMLR2NEM56HX',
  secretAccessKey: 'V2JiANz1qWsR2BmCQaiD35PURri79NUQJ05HgHdQ',
  region: 'ap-southeast-2',
  sessionToken: 'IQoJb3JpZ2luX2VjEDcaCmFwLXNvdXRoLTEiRjBEAiB/CbFmsbbPxrNQi3kaZKz57GM+i7ggg4bYWJLjV5uW1AIgMnmSQhMXf0l0hi6g9AF/yRTeL+11gvTVddvNp/rmxsQqtwII4P//////////ARAAGgw2Mzc1ODUwMjM3MTUiDAjhcS53+jYuqTbrbyqLAh0ZD3gKvVOOSCJiFO0f5TssabCHQUlQ2kAV5N3bZVB6xeu5t9oShoj81kRAUVrvR9NHiR+GZyGpyUDyn6yVrTOuU54yAOn7e7CDB3gLEbi0qgWeTQHZB+HJUWLdZ65jjoi32WPBotLJBlfBXVeWsxW+oYBNq4i2gRxB71mXAzxlM+BucG3LpYAWwJvqCRRnlGP9zpT93kBPL0n+9kwd80hK6olFzM8bWwu//sM4wvMuMZW0CYij0m3E3AvbI0ZF6w3T3twoYkm+vXTtQfacQNnrv7avEp33ZOLWA4Cx6tedEp0j4zNPXFbq5iCe+LKMHkTX/D9meuevuD/kAJD9Cb0eowl4Nz+Vn2O7dzCI2aatBjqeAanfoRfi3wxL8jJODbihMJvVy7Y4aH4VMwEAkXoVEK9JWE+cc02euB0d0GmSujEigVm9CFiPoHU9RKLglcngIFWl1yvK7YC+DV7BcGeDbpSStgeOqKYVGvz7bgHaL+9n1sT79GgrJLOGZ83eg1DngpwaqT5FBs/hj/OnVOpLO4z87SSXKS35+sBrllZNk8cVcoVkaJ+8I5u24meBa9Ih'
});
 */
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