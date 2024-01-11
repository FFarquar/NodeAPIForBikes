//https://dev.to/shubhambattoo/uploading-files-to-mongodb-with-gridfs-and-multer-using-nodejs-5aed
//More fully implemented this. Stil getting the TypeError: Cannot read properties of undefined (reading '_id') error

const express = require("express");
const app = express();

app.use(express.json());
app.set("view engine", "ejs");

const crypto = require("crypto");
const path = require("path");
const mongoose = require("mongoose");
const multer = require("multer");
const {GridFsStorage} = require("multer-gridfs-storage");
require('dotenv').config();

const port = 3000;

app.listen(port, () => {
  console.log("server started on " + port);
});

const mongoURI = "mongodb+srv://"+ process.env.MongoDB_User + ":" + process.env.MongoDB_Password +"@" + process.env.MongoDB_Cluster +"/"+ process.env.MongoDB_DB_Name;

// connection
const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// init gfs
let gfs;
conn.once("open", () => {
  // init stream
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "uploads"
  });
});

// Storage
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        console.log("In storage")
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString("hex") + path.extname(file.originalname);
          const _id = file._id;
          console.log("Id = " + _id);
          const fileInfo = {
            filename: filename,
            id: _id,
            bucketName: "uploads"
          };
          console.log("File info = " + fileInfo);
          resolve(fileInfo);
        });
      });
    }
  });
  
  const upload = multer({
    storage
  });

  app.post("/api/images/upload3", upload.single("file"), (req, res) => {
    res.redirect("/");
  });

