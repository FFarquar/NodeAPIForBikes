const express = require("express");
const bodyParser = require("body-parser");
const app = express()
const path = require("path");
var multer = require('multer');

const fs = require('@cyclic.sh/s3fs/promises')("cyclic-graceful-deer-fedora-ap-southeast-2")



const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads"), // cb -> callback
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  });
  
  const upload = multer({ storage: storage });

  const handleMultipartData = multer({
    storage,
    limits: { fileSize: 1000000 * 5 },
  }).single("file");

  module.exports = function(app){
    //app.post('/api/images/upload', upload.single('file'), (req, res) => {
    app.post('/api/images/upload', (req, res) => {
/*         const params = {
          Bucket: 'cyclic-graceful-deer-fedora-ap-southeast-2',
          Key: req.file.originalname,
          Body: req.file.buffer,
        }; */

        handleMultipartData(req, res, async (err) => {
            if (err) {
              res.json({ msgs: err.message });
            }
            res.json({
              body: req.body,
              file: req.file,
            });
          });

        /* fs.writefile(params, (err, data) => {
          if (err) {
            console.error(err);
            return res.status(500).send('Error uploading file');
          }
      
          res.send('File uploaded successfully');
        }); */
      });
    }