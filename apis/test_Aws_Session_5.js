//This is an evolution of test_Aws_Session_Tok_4.js. Using a an array parameter to accept a folder structure

var express = require("express");
    AWS = require('aws-sdk');
    bodyParser = require("body-parser");
    multer = require('multer');
    multerS3 = require('multer-s3');

//The AWS details came from the Data tab on the Cyclic website. In prod, these are taken from the server, no need to change anything.
//It seems this has to be removed prior to going to prod.
/* AWS.config.update({
  accessKeyId: 'ASIAZI4YHMLRTECQRVUA',
  secretAccessKey: 'EAhE9IBvIBFlYfam9LHWWe7gNLtYJH74sFYUuFv2',
  region: 'ap-southeast-2',
  sessionToken: 'IQoJb3JpZ2luX2VjEDMaCmFwLXNvdXRoLTEiRjBEAiAo3fzBe/ApKtH4H7rjKHPgz1IwD2JXJ08eiYvl/RihIgIgceq7ewYG9koxxe/JhhnLsen8+bpnuGAyBfajrHxw2noqtwII7P//////////ARAAGgw2Mzc1ODUwMjM3MTUiDGZNsfdKwkM9PCTJzyqLAiBRNeZqcvUl5mSnyM5F3Rdb5sw6cpYVJXKlfXZ7zTsOuTQcJMPDs4M2wtL8zd/JM7Mnvo1UFQRpIghzRmSh4cxNTMyP6fZjbU7wPfb2Q8i1mxCPfNU87v+T+W2WYpy08keGryM4wvLfdbe9pdi6n5OElfTPoiEJUGfud8MYphs57/js5vq3hLYafPB9wmX5zXU9RnBy/A+n6C1A6uBswo0DROZDLhnZXuLDatkcmykJBrDU6oRWRGtEKRB1MY4Zn1lrxY+N3tUz8ie8vooceN9YFfCKqA1Joj27X47+duMMs84xiWqi4uGrBLCtsMHJ/w/F4u8cExLs5TZSgdHw95xQ20dtqiT68BG7NTCb/t2tBjqeATBlT2Xn9W1cbXVUL5dYyzxLM2LD1CwLUGqayAeVut2AAC1GV05Mq5d9y/kT0kq2mLs5iSH/0Cvz7UoHS/iOoGg+/15uDwnntTi/CpYAXl6LfLn/D4CqtmvAWSMrIPWGhUxbHEBQSHL7yPMoOic+ghaCKY4PWVvpkiePz++3UKZCYMg1XxmJ/CzWkzuixGFdLEZuBsNnowAYF/qOF4wB'
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
          //console.log("req.body.folders " + req.body.folders)
          var folderArray =  req.body.folders.split(",")
          //console.log("Folderarray length = " + folderArray.length)
          //console.log("Fodler array = " + folderArray)
          var folderString;
          folderArray.forEach(element => {
            if (folderString != null) {
              folderString = folderString + "/" + element;  
            }
            else
            {
              folderString = element;  
            }
          }); 
          //console.log("folderString = " + folderString)

          //cb(null, `${req.body.directoryupper}/${req.body.directorylower}/${file.originalname}`); //use Date.now() for unique file keys
          cb(null, `${folderString}/${file.originalname}`); //use Date.now() for unique file keys
      }
  })
});

module.exports = function(app){

  //this example uses multi part with the directory set in the form-data
  app.post('/api/images/upload', upload.array('file',10), (req, res) => {
    console.log("In upload")
  //  console.log("req.body " + req.body.folders)

    var folderArray =  req.body.folders.split(",")
    var folderString;
    folderArray.forEach(element => {
      if (folderString != null) {
        folderString = folderString + "/" + element;  
      }
      else
      {
        folderString = element;  
      }
    }); 

     res.send({
      UploadResults: req.files.map(function(file) {
          return {Uploaded:'true', FileName: file.originalname, StoredFileName: file.location, ServerPath:`${folderString}/`, MimeType: file.mimetype, Size: file.size, ErrorCode:0};
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

     //console.log("Params = " + param.Bucket + " " +param.Key)
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