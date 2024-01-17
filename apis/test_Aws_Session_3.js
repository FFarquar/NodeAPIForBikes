//This is an evolution of test_Aws_Session_Tok.js. Trying to expand the functionality

var express = require("express");
    AWS = require('aws-sdk');
    bodyParser = require("body-parser");
    multer = require('multer');
    multerS3 = require('multer-s3');

//The AWS details came from the Data tab on the Cyclic website. In prod, these are taken from the server, no need to change anything.
//It seems this has to be removed prior to going to prod.
/* AWS.config.update({
  accessKeyId: 'ASIAZI4YHMLRTG44CZU5',
  secretAccessKey: 'AbeL3oQyVMNSAbxhiuVyW7bB3oqW7eUUAEiG3Wde',
  region: 'ap-southeast-2',
  sessionToken: 'IQoJb3JpZ2luX2VjEAgaCmFwLXNvdXRoLTEiRzBFAiBMpnzXKRDN6L1Htm6fymlNIt/OguKZlfST9LdSkveRjgIhAJ2Eil2J23Gel3DLBzfcJMDowLOeNtxj6pa/EioFqJw2KrcCCLH//////////wEQABoMNjM3NTg1MDIzNzE1Igzna8+PzkGYJJtcW3oqiwJt46yEPhF7m0TM1WmSHutzJ6quftY4saTrkrK+4BOtitiL8hQrJrd5CcxL+78m5N1OFcAxss7qfTsNOUqOXlm958I5wX22J7BQfUWkLR3/EkoVHELRUhEBDVu539MKhMny4yc1wPoP9tKtdq6C3ishKFByPxLbY0V1trhaJI5GgG4gGTD/7euC5S5/3S7UyCxUXra+7vDrJnqAByakH2TmW5k/DmjKvsu9kCmjrvGz2cVkwMFhrtyuW61JGyZOOvDmSQz8UVe784WucsA2446nyPla0eC4WKJ3R7R6bntsKP2/FrXgsVKZ9kpVWTks8gAbF+foKKDZmXgvzk8vlnZTXcs/kSOFD0AiTnUwoLWcrQY6nQEQlw2qe1CshkOlQvZmD6edJFyaWTLuKx7zAzw9b/I3vEEpCJYZSzAbs+0i83pIu+z2MAmivLcmz2sEucdgZTPOpdI+ZvG0LK45YaCyZ/VoljyzkMoQyvL/xhbI1wxagREACN1S7H7SGz/ZMCfWyDPbyCpVrR4ONsjjchf5DC4mNy9b1GZzYE75uyRhYpceR9EMsIwJB4HBpnHYJKEa'
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
  
    console.log("Params " + params.Prefix)

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