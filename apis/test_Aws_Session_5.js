//This is an evolution of test_Aws_Session_Tok_4.js. Using a an array parameter to accept a folder structure

var express = require("express");
    AWS = require('aws-sdk');
    bodyParser = require("body-parser");
    multer = require('multer');
    multerS3 = require('multer-s3');

//The AWS details came from the Data tab on the Cyclic website. In prod, these are taken from the server, no need to change anything.
//It seems this has to be removed prior to going to prod.
/* AWS.config.update({
  accessKeyId: 'ASIAZI4YHMLR5QF4QHHA',
  secretAccessKey: 'c+vNjx4/VA/TUSwM2hjYSpyreK7kdNdXCDt9r12q',
  region: 'ap-southeast-2',
  sessionToken: 'IQoJb3JpZ2luX2VjEEEaCmFwLXNvdXRoLTEiSDBGAiEAub5P81YBsmV3NEFm0rPDw+pOVexoVxXVzXtRhbS2JhMCIQDVIGPeogXWrqs41oPBBk/1XTLrJtQDGRVLv7j0iske9yq3Agj6//////////8BEAAaDDYzNzU4NTAyMzcxNSIMTJhYRFgrxEsW4l2LKosCAt+4VjTbgU3fbmcqUdYAoMGOdXCkMXfflWOUvPwtEp/WiD+m++swKDh8U76W6yY4wBK1aXLqU7R4tv33srNYwDpGqLJqYFxQZeFNnvnrlXV7ETwVB6qgjFcfIiAfZf8NIqu/3kOyKLrrzxBPKmC3fOLmU6GHPNPocdH2bQA0Nr+j+H2clnAUo/WnnNumcX7Udg2Cfv4PnSd9rgOg2Vtsw9dMLWo9wvBroBJwaUo4PVzEWX2KVpQPGjDPtuchvX1BnK/TSTvI3u9B5clZmvy0TGjWWXA6Z379t1pFSKaEsyMkySIOdlhYkmjk3CeTeA2bOz3PE3ZKXszp4yzA/nI/fTmAb1RRkiM7iaGrMPCM4a0GOpwBvcKAwM/Bby4Uz4IH1CxQrDULq9ngY/j25OiduQBegjIbdF+WPhtJeK/OdzQ1xI0UxJY/W9TCOs75z2xm9oaqC5mfx+uDvxZrQhyYnBTGFNGdOSR5K+eru6liDZxvUM973sF0vvYpVt1FZL3rVIpOCIzU20X1ZKj3ZLspRSYWW5gv4yrWxSNtyEoImciCTIK9PEEoPG08K9cvWtAZ'
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
          console.log("req.body.folders " + req.body.folders)
          var folderArray =  req.body.folders.split(",")
          console.log("Folderarray length = " + folderArray.length)
          console.log("Fodler array = " + folderArray)
          var folderString;
          folderArray.forEach(element => {
            if (element != "") {
              if (folderString != null) {
                folderString = folderString + "/" + element;  
              }
              else
              {
                folderString = element;  
              }
            }
          }); 
          console.log("folderString = " + folderString)

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
      if (element != "") {
        if (folderString != null) {
          folderString = folderString + "/" + element;  
        }
        else
        {
          folderString = element;  
        }
      }
    }); 

     res.send({
      UploadResults: req.files.map(function(file) {
          return {Uploaded:'true', FileName: file.originalname, StoredFileName: file.location, ServerPath:`${folderString}/`, MimeType: file.mimetype, Size: file.size, ErrorCode:0};
      })
    });
 
  });

  app.get('/api/images/getfilesinfolder/:folderscommasep', async (req, res) => {
    console.log("In getfilesinfolder")

    var folderArray =  req.params.folderscommasep.split(",")
    var folderString;


    folderArray.forEach(element => {
      if (element != "") {
        if (folderString != null) {
          folderString = folderString + "/" + element;  
        }
        else
        {
          folderString = element;  
        }
      }
    }); 
    
    //folderString = folderString + "/";
    console.log("FolderString = " + folderString)
    const params = {
      Bucket: 'cyclic-graceful-deer-fedora-ap-southeast-2',
      Prefix: `${folderString}`    
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

  app.delete('/api/images/delete/:folderscommasep/:filename', async (req, res) => {
    console.log("In delete")      

    var folderArray =  req.params.folderscommasep.split(",")
    var folderString;
    folderArray.forEach(element => {
      if (element != "") {
        if (folderString != null) {
          console.log("Element folder = " + element)      
          folderString = folderString + "/" + element;  
        }
        else
        {
          folderString = element;  
          console.log("First element = " + element)      
        }
          
      }
    }); 



    var deleteParam = {
      Bucket: 'cyclic-graceful-deer-fedora-ap-southeast-2',
      Key: `${folderString}/${req.params.filename}`

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

    app.get('/api/images/getafile/:folderscommasep/:filename', async (req, res) => {
     console.log("In getafile")      

     var folderArray =  req.params.folderscommasep.split(",")
     var folderString;
     folderArray.forEach(element => {
       if (element != "") {
         if (folderString != null) {
           folderString = folderString + "/" + element;  
         }
         else
         {
           folderString = element;  
         }
           
       }
     }); 
     var param = {
       Bucket: 'cyclic-graceful-deer-fedora-ap-southeast-2',
       Key: `${folderString}/${req.params.filename}`
     };    


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