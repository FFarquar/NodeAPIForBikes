//This is an evolution of test_Aws_Session_Tok_4.js. Using a an array parameter to accept a folder structure

var express = require("express");
    AWS = require('aws-sdk');
    bodyParser = require("body-parser");
    multer = require('multer');
    multerS3 = require('multer-s3');

const { adminAuth, userAuth} = require("../middleware/auth.js");    

//The AWS details came from the Data tab on the Cyclic website. In prod, these are taken from the server, no need to change anything.
//It seems this has to be removed prior to going to prod.

if (process.env.NODE_ENV == "development") {
  AWS.config.update({
    accessKeyId: 'ASIAZI4YHMLR3W5PRAV2',
    secretAccessKey: 'mg/gjyKuU61GOaZxoJoWGUTQKBHFOdIMZRxvnat1',
    region: 'ap-southeast-2',
    sessionToken: 'IQoJb3JpZ2luX2VjEEwaCmFwLXNvdXRoLTEiSDBGAiEA3H4qpvg0KZJWgUj4QMY9G/JGXq/nnmbBNh9N2umtLBECIQCKHZy9pyPfe7oik85PwBqkeJ1bUqSDbPTh0CdwmNwfySquAggVEAAaDDYzNzU4NTAyMzcxNSIM/xeIpl2K0ystxbGzKosCWZxQAnDVW34ieS6aOD5dPCZC7hLnS/kB5xGE8YU3AUujYkAmyabQIIJuJBzY+ypGVKd3Qvk7GjyZgUwe5NvZiuC8PIW1dB9mlMrmH5Hb2ZHhtD+dTHli0VmHKyy3w7FZjzrSGUIw+MJJyBNI3UHcPhr4pnfC3LxtDsM/wnkxsSx9ZSdjbNKTZF+6BWNhSiFNBqwyq5RsutQ0GJ1pK3RMyEJBv8bss/XgZXDznygXMIKgxGidVyRUvoF6BPernF6vX11oKaOyXND5d2hXm80HLyC2SuxMaevT2M3mECi6q+ZsTMjPAH40/0bXpikk2Hyu6h+TLFMDJOhkuttNNsTE7lTW3VoB5IHVLcbCMMLA460GOpwBa0JOyQtWzyQPfySCfwSzDBhMK3WZHB6ogWly3f5ybJVC79STba8Yd7tK/yivhbG8WNvdAI0PVNZ+olPPcRcKXOAayfd4YMc9kuPgDFoT1vfsWuhhFtqBSIg7kGjeW5Hb4n5qUonyYFd3wickm3r5Tsh4hQudMgUnjidJrZ+30q12oWLBO0I+8u3yKg7JzfzpzomL6i8a4y4tci73'
  });
  
}
/* AWS.config.update({
  accessKeyId: 'ASIAZI4YHMLR3W5PRAV2',
  secretAccessKey: 'mg/gjyKuU61GOaZxoJoWGUTQKBHFOdIMZRxvnat1',
  region: 'ap-southeast-2',
  sessionToken: 'IQoJb3JpZ2luX2VjEEwaCmFwLXNvdXRoLTEiSDBGAiEA3H4qpvg0KZJWgUj4QMY9G/JGXq/nnmbBNh9N2umtLBECIQCKHZy9pyPfe7oik85PwBqkeJ1bUqSDbPTh0CdwmNwfySquAggVEAAaDDYzNzU4NTAyMzcxNSIM/xeIpl2K0ystxbGzKosCWZxQAnDVW34ieS6aOD5dPCZC7hLnS/kB5xGE8YU3AUujYkAmyabQIIJuJBzY+ypGVKd3Qvk7GjyZgUwe5NvZiuC8PIW1dB9mlMrmH5Hb2ZHhtD+dTHli0VmHKyy3w7FZjzrSGUIw+MJJyBNI3UHcPhr4pnfC3LxtDsM/wnkxsSx9ZSdjbNKTZF+6BWNhSiFNBqwyq5RsutQ0GJ1pK3RMyEJBv8bss/XgZXDznygXMIKgxGidVyRUvoF6BPernF6vX11oKaOyXND5d2hXm80HLyC2SuxMaevT2M3mECi6q+ZsTMjPAH40/0bXpikk2Hyu6h+TLFMDJOhkuttNNsTE7lTW3VoB5IHVLcbCMMLA460GOpwBa0JOyQtWzyQPfySCfwSzDBhMK3WZHB6ogWly3f5ybJVC79STba8Yd7tK/yivhbG8WNvdAI0PVNZ+olPPcRcKXOAayfd4YMc9kuPgDFoT1vfsWuhhFtqBSIg7kGjeW5Hb4n5qUonyYFd3wickm3r5Tsh4hQudMgUnjidJrZ+30q12oWLBO0I+8u3yKg7JzfzpzomL6i8a4y4tci73'
});
 */
var app = express()
    s3 = new AWS.S3();

app.use(bodyParser.json());

var upload = multer({

  storage: multerS3({
      s3: s3,
      bucket: process.env.CYCLIC_BUCKET_NAME, //'cyclic-graceful-deer-fedora-ap-southeast-2',
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
  app.post('/api/images/upload', adminAuth, upload.array('file',10), (req, res) => {
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

  app.get('/api/images/getfilesinfolder/:folderscommasep', adminAuth, async (req, res) => {
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
      Bucket: process.env.CYCLIC_BUCKET_NAME,//'cyclic-graceful-deer-fedora-ap-southeast-2',
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

  app.get('/api/images/getlisteverything', adminAuth, async (req, res) => {
    console.log("In get")        
    console.log("")   
    console.log("")   

    const params = {
      Bucket: process.env.CYCLIC_BUCKET_NAME//'cyclic-graceful-deer-fedora-ap-southeast-2'

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

  app.delete('/api/images/delete/:folderscommasep/:filename', adminAuth, async (req, res) => {
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
      Bucket: process.env.CYCLIC_BUCKET_NAME,//'cyclic-graceful-deer-fedora-ap-southeast-2',
      Key: `${folderString}/${req.params.filename}`

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

    app.get('/api/images/getafile/:folderscommasep/:filename', adminAuth, async (req, res) => {
     //console.log("In getafile")      
     //console.log("folderscommasep = " + req.params.folderscommasep)      
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
     console.log("Folder string = " + folderString);
     var param = {
       Bucket: process.env.CYCLIC_BUCKET_NAME,//'cyclic-graceful-deer-fedora-ap-southeast-2',
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
       res.send(data.Body);        // Send File Buffer
     });

    });     


  
}