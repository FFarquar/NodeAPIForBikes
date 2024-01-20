//This is an evolution of test_Aws_Session_Tok.js. Trying to expand the functionality

var express = require("express");
    AWS = require('aws-sdk');
    bodyParser = require("body-parser");
    multer = require('multer');
    multerS3 = require('multer-s3');

//The AWS details came from the Data tab on the Cyclic website. In prod, these are taken from the server, no need to change anything.
//It seems this has to be removed prior to going to prod.
/* AWS.config.update({
  accessKeyId: 'ASIAZI4YHMLR7VVZJQWF',
  secretAccessKey: 'w8RXXqq8De7I2ncQ75bw/h3vOFv3FGF4m5jKFOK3',
  region: 'ap-southeast-2',
  sessionToken: 'IQoJb3JpZ2luX2VjEFQaCmFwLXNvdXRoLTEiRjBEAiAlc5ssoqixyu8lXIH/pYYH/9UUt3pWAT2lqlmd+VAwewIgSwtBOkaTrKgBl9cJuwmc2OGxyimnFBYgaXMIz2aY/DIqtwII/f//////////ARAAGgw2Mzc1ODUwMjM3MTUiDLLw7pSNAnLbjmIHriqLAt31CQtoUSRbI4HKYOMvyTN/7+gdR9mOgwB2GMrGoR2aozJCck7bTaSBGXt8pQyG3zkglZicOTETAsmdCdt4t3jH8Y95MUHPfNhXsb5xlmnWoEhXVAChZvVNxE3EEK2rOzDCg6/rmhb/iEX1p0N9+0z7dCr0bRtXS6ha1iWR6sU3HNWtEaxUXhxffeyslTlGW8ulEHFLh896xjIUONW4FxmJi8qzduLm9rFKDz+Q8Ie5YeLiRtIgE27rZyWOXx7IqLT6YzpfUZJp35xnwVkIBcwv8wss4UXVUfx4wpM2uRQ3EPm/3Dl/D7xzfQOZU/ObLRooLcrAIT5LkMG2Rtcdg1UxLJ0cJJGGPos/BzCuk62tBjqeATQ1Voh94WbCwPfxKQoeUvk+EFAFuhfM2Y3PMzPKYO3w7OajS1G4wzQx6KPaYFyFitHa4bWt4DlRqjBzX0uHG69t60ufhniAIcIO9KD4/5VzFFjVuWIillVVvBHu5ZYez7AYiL6WolqZMC2G95+B0GLBU/+8L7gU7GnO0a90HJKcbT46vwHIVxfo3y3S1LNaIrJMUJXXLpzvA26Iy1u3'
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