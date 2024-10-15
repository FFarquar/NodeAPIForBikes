var express = require("express");



const AWS = require('aws-sdk');
const { adminAuth, userAuth } = require("../middleware/auth.js");
const multerS3 = require('multer-s3');
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.S3_REGION,
});

const s3 = new AWS.S3();

const multer = require('multer');

var upload = multer({

    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET,
        key: function (req, file, cb) {
            console.log(file);
            console.log("req.body.folders " + req.body.folders)
            var folderArray = req.body.folders.split(",")
            console.log("Folderarray length = " + folderArray.length)
            console.log("Fodler array = " + folderArray)
            var folderString;
            folderArray.forEach(element => {
                if (element != "") {
                    if (folderString != null) {
                        folderString = folderString + "/" + element;
                    }
                    else {
                        folderString = element;
                    }
                }
            });
            console.log("folderString = " + folderString)

            //cb(null, `${req.body.directoryupper}/${req.body.directorylower}/${file.originalname}`); //use Date.now() for unique file keys
            cb(null, `${folderString}/${file.originalname}`); //use Date.now() for unique file keys
        }
    })
});


module.exports = function (app) {
    app.post('/api/files/upload', adminAuth, upload.array('file', 10), (req, res) => {

        var folderArray = req.body.folders.split(",")
        var folderString;
        folderArray.forEach(element => {
            if (element != "") {
                if (folderString != null) {
                    folderString = folderString + "/" + element;
                }
                else {
                    folderString = element;
                }
            }
        });

        res.send({
            UploadResults: req.files.map(function (file) {
                return { Uploaded: 'true', FileName: file.originalname, StoredFileName: file.location, ServerPath: `${folderString}/`, MimeType: file.mimetype, Size: file.size, ErrorCode: 0 };
            })
        });

    });
}


