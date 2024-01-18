//This is an evolution of test_Aws_Session_Tok.js. Trying to expand the functionality

var express = require("express");
    AWS = require('aws-sdk');
    bodyParser = require("body-parser");
    multer = require('multer');
    multerS3 = require('multer-s3');

//The AWS details came from the Data tab on the Cyclic website. In prod, these are taken from the server, no need to change anything.
//It seems this has to be removed prior to going to prod.
/* AWS.config.update({
  accessKeyId: 'ASIAZI4YHMLRTTVCXXUC',
  secretAccessKey: 'YVTq0dcjqfBFpJs8ISZv/+GFYEpVIBFiqW5VoFkf',
  region: 'ap-southeast-2',
  sessionToken: 'IQoJb3JpZ2luX2VjECQaCmFwLXNvdXRoLTEiRjBEAiAGueRJvG/gSfcjDqjS1EQ4iCXEsLOBwBQChkLY/4OtWQIgZXme2S0dSPZvKaQe3lLKM2xx6IwIOnEcLWh7AbWxDZoqtwIIzv//////////ARAAGgw2Mzc1ODUwMjM3MTUiDHL3C75EYJ6Uol2FZiqLAtbTh7obr9jYyGfC0cxNFyC7aZM4G2WcTPuQcSEAmFt8x4XQSOohm8uqL92ohHnW+BqVPouI45akwZuGUVkGO0sLyJ9E3qWqORKPYk7POcYSrPgM2OWZT6rL5gesdq78wQpuysjL2GKn1lZEStn9haYkNJ2gFfqjy4I9Au0gdtOdou0NSi3+wyQRg+tDeLpS8Rn9DqGcGofdM2YRVb4etaaL8U/xqnBPHwR7A56/wBu4F0k8nk/dMo7euLOkzqA3zR+I8UC7KZhCfHXL1Y4d6PwnLbW9hobn36pm6aeGOUpY6Q9Xq/pDRtCs0GRHp/ZRmmXX4UGRxQxPY7nimgF7Vh2jZBjQ0OrPmzaZ/TDwzqKtBjqeAd1ZN0c6unXh5wv0L3kMoC7dHyl0lyU2rj9bZV2DvTIl7RUE7HZuplq8DX+cDXbgcM2Z8BBdD9x7OOn0JMFT2KICNX01p+cya0LrQfz7CcbtPktcKk2h2/7EDJM7NJPo1G5m5iBzLVu00JhvZgxkPh9M4IGq1IkM/eIzb4YvRlA2ZqiKs3AJkCWnhg2427hiICUdrC4kwpgZUimaaDYx'
}); */

var app = express()
    s3 = new AWS.S3();

app.use(bodyParser.json());

var upload = multer({
  storage: multerS3({
      s3: s3,
      bucket: 'cyclic-graceful-deer-fedora-ap-southeast-2',
      key: function (req, file, cb) {
          console.log(file);
          cb(null, `${req.body.directoryupper}/${req.body.directorylower}/${file.originalname}`); //use Date.now() for unique file keys
          //cb(null, file.originalname); //use Date.now() for unique file keys
      }
  })
});



module.exports = function(app){

  //this example uses multi part with the directory set in the form-data
  app.post('/api/images/upload', upload.array('file',10), (req, res) => {
    console.log(req.file)

    res.send({
      message: "Uploaded!",
      urls: req.files.map(function(file) {
          return {url: file.location, name: file.key, type: file.mimetype, size: file.size};
      })
    });

  });

  app.get('/api/images/getfilesinfolder/:upperfolder/:lowerfolder', async (req, res) => {
    console.log("In getfilesinfolder")
    let upperfolder = req.params.upperfolder
    let lowerfolder = req.params.lowerfolder
  
    const params = {
      Bucket: 'cyclic-graceful-deer-fedora-ap-southeast-2',
      Prefix: `${upperfolder}/${lowerfolder}`    //The prefix doesent work when going down another level, like 2~3 even with delimter
    };
  
    //console.log("Params " + params.Prefix)

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