//This is an attempt to save files to AWS. This ability is provided by cyclic. Perhaps the data could be stored in that locale too
//Using this example https://abbaslanbay.medium.com/uploading-files-to-aws-s3-with-multer-and-the-node-js-aws-sdk-7cad8dc87fc2

//USing the code developed in savetojws.js and adding session token

//Adding session token allowed this to work in TEST YAH

//Trying in prod now

const express = require("express");
const bodyParser = require("body-parser");
const app = express()

const AWS = require('aws-sdk');

//The AWS details came from the Data tab on the Cyclic website
AWS.config.update({
  accessKeyId: 'ASIAZI4YHMLRT33BB4H2',
  secretAccessKey: 'wM6nYIPwtxepHSYXg2ybnsEGj9yTKLD5I6LGCsPf',
  region: 'ap-southeast-2',
  sessionToken: 'IQoJb3JpZ2luX2VjENz//////////wEaCmFwLXNvdXRoLTEiSDBGAiEAj9Bn6tEpQRRtEK/Fsbuf7Iv4H8LtLun1Em3TGqqann4CIQDbD/r5c3qwL3vDPd0F1jF1czjcrDFzBfvuLXauWkw5Uiq3AgiF//////////8BEAAaDDYzNzU4NTAyMzcxNSIMM4pFXzWR2dUApdQgKosCPSDwGysVxHmo+vqjil+suJgeusTgN9EFAYI+3NfQOzUgH6rWhduPU1wn+5V6fPiqctETeQywt60BOZaovhTin6a2rhkqqILnDDrTS9QNo/JetesmjD/xkH8ddWECzUXJDMztr0jvz3pn4sWt2Nv8Fk2LmNwwKZcpwoME5Vj6eeMim7feSEIv/SnmIHNdAs+e1bTJIkyjwBN4CsYmxa+3OWJGcjCjSwTcvJ0ZdAeWX9IMgh5w40a9U5oeQ455+Z58omZ/tbM4qIEYc+e1WLX1VYUDQ4HcjTtOh9lFZPwrvG/BzQJlpnqzKkZ7NfNvXe+vvQzgK1c9uBI6i2HRvibDlF4wSc4KzYqcbwJeMNjlkq0GOpwB6+Ue7i+Qy/rFKhoEhiOjMOjDIPtD1UzCBQtUdTIQN19Ezg9lkb9dIFo/98UIBsReT06WNYx5YMIvLMI1l49LQ8eYupKAVnsm09bI8u5WXs01/CPB+/1tI1XHm4r3rMwrNASEuQSSiI8zhchJtU/U97aik0tfSSI94PO4ci00T3XFk6n5pVBnQR6dUJZ8R0ZCJJG+Kcx8INfWeNlJ'
});

const s3 = new AWS.S3();

const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // limit file size to 5MB
  },
});

module.exports = function(app){
app.post('/api/images/upload', upload.single('file'), (req, res) => {
    const params = {
      Bucket: 'cyclic-graceful-deer-fedora-ap-southeast-2',
      Key: req.file.originalname,
      Body: req.file.buffer,
    };
  
    s3.putObject(params, (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error uploading file');
      }
  
      res.send('File uploaded successfully');
    });
  });
}