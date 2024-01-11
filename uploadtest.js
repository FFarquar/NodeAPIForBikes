//Following this example to upload images to MOngo
//ATTTEMPT 1: https://dev.to/collegewap/how-to-save-images-to-mongodb-in-nodejs-dog NOTE: It had a package dependency issue
//that made me try something else
//ATTTEMPT 2: https://hevodata.com/learn/mongoose-gridfs/
//The code below creates a bucket but doesnt do much else. Need to find a better example
//ATTTEMPT 3: https://stackoverflow.com/questions/57763431/express-node-js-how-to-save-image-as-binary-in-mongodb-and-display-on-the-screen
//I only want to upload small files. Mongo can store 16mb without issue, so no need for other controls to break down large images to bigger ones


const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const Schema = mongoose.Schema;

const cors = require('cors');
const { adminAuth, userAuth } = require("./middleware/auth.js");


mongoose.set('strictQuery', false);
require('dotenv').config();
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(express.static("public"));

const fs = require("fs");
const multer = require("multer");
const path = require("path");

console.log("Port : " + PORT);

const {GridFsStorage} = require('multer-gridfs-storage');
/* 
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"), // cb -> callback
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const handleMultipartData = multer({
  storage,
  limits: { fileSize: 1000000 * 5 },
}).single("image"); */
const dbstring = "mongodb+srv://"+ process.env.MongoDB_User + ":" + process.env.MongoDB_Password +"@" + process.env.MongoDB_Cluster +"/"+ process.env.MongoDB_DB_Name;

const storage = new GridFsStorage({
  url: dbstring,
  file: (req, file) => {
    
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

const upload = multer({ storage: storage });

let gfs;
const db = async () => {
  try {

    console.log("dbstring = " + dbstring);
    const conn = await mongoose.connect(dbstring);
  
    module.exports = conn;

    gfs = Grid(db, mongoose.mongo);  
    gfs.collection('uploads');
  
    console.log("MonoDB Connected: " + await conn.connection.host);


    } catch (error) {
    console.log(error);
    process.exit(1);
  }


}



db().then(() => {
  app.listen(PORT, ()=> {
    console.log("Listening for requests");
  })
});

app.post('/api/images/upload', async (req, res) => {

  console.log("In handler");
  handleMultipartData(req, res, async (err) => {
    if (err) {
      res.json({ msgs: err.message });
    }

    res.json({
      body: req.body,
      file: req.file,
    });
  });
})




/* let gfs;

conn.once("open", () => {
    //initialize the stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection("uploads");
});
 */
//route for POST - upload data to mongo
app.post('/api/images/upload2', fileUpload, (req, res) => {
  console.log("In handler for upload2");
  const file = { file: req.file };
  
  //res.redirect('/');
});

function fileUpload(req, res, next) {
  console.log("In fileupload");
  upload.single('file')(req, res, next);
  console.log("After upload single");
  next();
}