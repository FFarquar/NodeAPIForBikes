//this example uses the @cyclic.sh/s3fs to treat the AWS S3 service as the file system
//It works in dev, now need to test it in prod. Fingers crossed

//Not working in prod. ENOENT: no such file or directory, open 'uploads/1705205163686-586849938.jpg'"

const express = require("express");
const bodyParser = require("body-parser");

const app = express()
const path = require("path");
const BUCKET = process.env.BUCKET


var multer = require('multer');

const fs = require('@cyclic.sh/s3fs/promises')(BUCKET)


/* const storage = multer.diskStorage(
    {
  
    destination: (req, file, cb) => cb(null, "s3fs"), // cb -> callback    //this works locally, but not in prod
    //destination: (req, file, cb) => cb(null, ""), // cb -> callback

    
    filename: async (req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${path.extname(file.originalname)}`;

      cb(null, uniqueName);

      console.log(req.body._id) //this is how to read the other values submitted in the multi part
    },
  });
  
  const upload = multer({ storage: storage });

    const handleMultipartData = multer({
    storage,
    limits: { fileSize: 1000000 * 5 },
  }).single("file");
 */

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // limit file size to 5MB
    },
  });


  //var urlencodedParser = bodyParser.urlencoded({ extended: false })
  //var jsonParser = bodyParser.json()

  module.exports = function(app){
    app.post('/api/images/upload', upload.single('file'), (req, res) => {
    //app.post('/api/images/upload', async (req, res) => {
/*         const params = {
          Bucket: 'cyclic-graceful-deer-fedora-ap-southeast-2',
          Key: req.file.originalname,
          Body: req.file.buffer,
        }; */

        fs.upload()
    fs.upload(params, (err, data) => {
        if (err) {
        console.error(err);
        return res.status(500).send('Error uploading file');
        }

        res.send('File uploaded successfully');
    });

        /* handleMultipartData(req, res, async (err) => {
            if (err) {
              res.json({ msgs: err.message });
            }
            res.json({
              body: req.body,
              file: req.file,
            });
          });
 */
        /* fs.writefile(params, (err, data) => {
          if (err) {
            console.error(err);
            return res.status(500).send('Error uploading file');
          }
      
          res.send('File uploaded successfully');
        }); */
      });
    }