//Copied this from https://www.settletom.com/blog/uploading-images-to-mongodb-with-multer
//Has the same problem with the Grid(conn.db) line not working correctly. File is uploaded to atlas, but error

const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const app = express()
const multer = require("multer");

const {GridFsStorage} = require('multer-gridfs-storage');

require('dotenv').config();

app.use(bodyParser.json())

const port = 3000

app.listen(port, () => console.log(`Server started on port ${port}`))

//Connect to DB
const mongoose = require('mongoose')

const dbstring = "mongodb+srv://"+ process.env.MongoDB_User + ":" + process.env.MongoDB_Password +"@" + process.env.MongoDB_Cluster +"/"+ process.env.MongoDB_DB_Name;

const conn = mongoose.createConnection(dbstring)

//let gfs
conn.once('open', () => {
  console.log('Connection Successful')
/*   gfs = Grid(conn.db, mongoose.mongo)
  gfs.collection('uploads')
  console.log('Connection Successful')
 */})

// Create storage engine
/*  const storage = new GridFsStorage({
    url: dbstring,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err)
          }
          const filename = file.originalname
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads',
          }
          resolve(fileInfo)
        })
      })
    },
  }) */
 
  const storage = new GridFsStorage({
    url: dbstring,
    file: (req, file) => {
        console.log("In new storage ");
        return new Promise((resolve, reject) => {
            const filename = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
            console.log(file.originalname);
            const fileInfo = {
                filename: filename,
                bucketName: "uploads"
            };
            console.log(fileInfo);
            resolve(fileInfo);
            console.log("After resolve");
        });
    }
  });
  

  const upload = multer({ storage })
  

  app.post('/api/images/upload2', upload.single('file'), (req, res, err) => {
    if (err) throw err
    res.status(201).send()
  })
  