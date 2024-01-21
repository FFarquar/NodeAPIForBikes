//This is an evolution of test_Aws_Session_Tok.js. Trying to expand the functionality

var express = require("express");
    AWS = require('aws-sdk');
    bodyParser = require("body-parser");
    multer = require('multer');
    multerS3 = require('multer-s3');

//The AWS details came from the Data tab on the Cyclic website. In prod, these are taken from the server, no need to change anything.
//It seems this has to be removed prior to going to prod.
AWS.config.update({
  accessKeyId: 'ASIAZI4YHMLRTV37MMF5',
  secretAccessKey: 'ABSszAob2P3TlLsaE+nqUfZbn5YbY1uugYnLZ6rH',
  region: 'ap-southeast-2',
  sessionToken: 'IQoJb3JpZ2luX2VjEG0aCmFwLXNvdXRoLTEiRzBFAiEA2w+x/ApTwpLMIOOfnQWDqQKOF+0ngQcuxCzPiEpnkH0CIEH/U2ToPRXhAsva2U/MVtvWrU6UlH5f0Jkm1GzhP3FLKq4CCCYQABoMNjM3NTg1MDIzNzE1Igwq4yDqCa7lePahcY8qiwJJmklfVZZlogJo4QW5Cuiv2coVMM7ymDCbAc9J4XI9oalRZYg31mtyzgyGiYni9UsZXL5unvAdzfAv/V9XF9p863/5Iyrv9D8Rs7nngb9WeF95bulZIRZ1XO1NCovBEroBRFsMENS+JuQ9FH5Gkxf6goaRmm1rOOviwZciOwZ5rD9ASqQxkGu8uQeEoz6h2yvoRKEQKIH9AfTTVOVK5zG6WZYHahg9ut7JUwcwmlefHriYQYHjyTvZHa/I2n9C4fwy5JIicwvpS54CUGxERpG7l8L2QkJrA4UPOyb0nD+NzzuvRLqE/6C4EiNYDAOlPRoZBjZPDRFyCvF26Du4vxjL2G+ZiOoZWTY3DI0wv8eyrQY6nQFqhTJKgi9aO/hTS8jEG2//hhiQrRk0xyaDTfhS9a/93j9jg8fhc7HqS3ZQVmFGyS9jRcqtM34cibsuLghIGCELCCsxyCFwjyN/snWUBMUSBCQ2ETKY1hqcZhkfA8chzcITeNrSdNOll9tD6FLIlR8t+b8mUTsP+W34tHFE3CjiI2N8I4UreeGUZbFj2mwVkWa4jSpgy/5z86JE5l1b'
});

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

    console.log("Params = " + param.Bucket + " " +param.Key)
    s3.getObject(param, function(err, data) {
      if (err) {
        console.error(err);
        return res.status(500).send('Error getting file ' + param.Key + ". " + err.message);
      }


      res.status(200);
      res.attachment(param.Key); // Set Filename
      res.type(data.ContentType); // Set FileType
      //console.log("Response = " + data.Body)      
      res.send(data.Body);        // Send File Buffer
    });

   });   

}