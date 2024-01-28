//This is an evolution of test_Aws_Session_Tok.js. Trying to expand the functionality

var express = require("express");
    AWS = require('aws-sdk');
    bodyParser = require("body-parser");
    multer = require('multer');
    multerS3 = require('multer-s3');

//The AWS details came from the Data tab on the Cyclic website. In prod, these are taken from the server, no need to change anything.
//It seems this has to be removed prior to going to prod.
AWS.config.update({
  accessKeyId: 'ASIAZI4YHMLR62R2EBAL',
  secretAccessKey: 'nq0q4Omj3CTr8xBVQPGxVZ4E8+uRWggQ/4Xh5awp',
  region: 'ap-southeast-2',
  sessionToken: 'IQoJb3JpZ2luX2VjEBwaCmFwLXNvdXRoLTEiSDBGAiEA9G/zmHCCZQncI3VI9AC9IjxW/7bbmwtVBk/DwWk7NJgCIQDqFH+oOz2NAfZ9GnXGNcxy9TKvhfSIVy8z4fjfCleYqyq3AgjV//////////8BEAAaDDYzNzU4NTAyMzcxNSIMLuxuYFCT3pfATfNKKosCX4VKCblhuivFk0e1KaSXKEg7mtCU8NmChhqynTd7tUdH8wnBwPYk+c+vWYO4pgdmL9ro0ttECGFKKSav93q/JU2zYQsaGv/afNBfu1KlQp/Ex1eBEAAzVpGtWxUdEBOHf6yF7Zdq+rq5VtItiScBFLxysWVOryz5BZS21XFpb+lCgBL1Dl6TiyMR1lJVpLsmpFt3j2C0plivJa82imbCEAKtxWjF4pgxWGpj/s+kabGxeCa/OEr5BnAXGcYes26eDN52Hqmzvtco3JUqchzH8ttDJwJ2byP0lJb8I7e2qpooZ/V76xSB692kr5jJ+ruC3ytldXFLhW6UPwRwk1FAzYPkVdlr+XFzQ8rjMJ+F2a0GOpwBFe/6qeRz3p29ZMHGgddTJdQpFPHo293VqohSNMDGoQru823gafRdWfzezLDXQRWAkOOCknYCTtjsmMzRhP7l8J6/VCrweaLZCO3OSHcEYHmkCupOdRmUbrgH73heQAguP1QsvYMVC2DQ5ynuvd1kZmI8NeFY9pe3SuO+bN4dLTdrr8WL9QLEYDGma6BZd1TO8/eHDiuNu22f6CEn'
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