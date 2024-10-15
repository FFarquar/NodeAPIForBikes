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

    app.get('/api/files/getafile/:folderscommasep/:filename', adminAuth, async (req, res) => {
        console.log("In getafile")
        //console.log("folderscommasep = " + req.params.folderscommasep)
        var folderArray = req.params.folderscommasep.split(",")
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
        console.log("Folder string = " + folderString);
        var param = {
            Bucket: process.env.S3_BUCKET,//'cyclic-graceful-deer-fedora-ap-southeast-2',
            Key: `${folderString}/${req.params.filename}`
        };


        s3.getObject(param, function (err, data) {
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

    app.delete('/api/files/delete/:folderscommasep/:filename', adminAuth, async (req, res) => {
        console.log("In delete")

        var folderArray = req.params.folderscommasep.split(",")
        var folderString;
        folderArray.forEach(element => {
            if (element != "") {
                if (folderString != null) {
                    console.log("Element folder = " + element)
                    folderString = folderString + "/" + element;
                }
                else {
                    folderString = element;
                    console.log("First element = " + element)
                }
            }
        });

        var deleteParam = {
            Bucket: process.env.S3_BUCKET,
            Key: `${folderString}/${req.params.filename}`
        };

        console.log("File to delete = " + deleteParam.Key)

        s3.deleteObject(deleteParam, function (err, data) {
            if (err) {
                console.error(err);
                return res.status(500).send('Error deleting file');
            }

            res.status(200);
            res.send('File deleted successfully ');
        });

    });

    app.get('/api/files/getlisteverything', adminAuth, async (req, res) => {
        console.log("In get")
        console.log("")
        console.log("")

        const params = {
            Bucket: process.env.S3_BUCKET//'cyclic-graceful-deer-fedora-ap-southeast-2'

        };

        const data = await s3.listObjectsV2(params).promise();

        var out = [];
        for (obj of data.Contents) {
            const obj1 = { "Key": obj.Key }
            console.log(obj.Key)

            out.push(obj1)
        }
        res.send(out)

    });

    app.get('/api/files/getfilesinfolder/:folderscommasep', adminAuth, async (req, res) => {
        console.log("In getfilesinfolder")

        var folderArray = req.params.folderscommasep.split(",")
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

        //folderString = folderString + "/";
        console.log("FolderString = " + folderString)
        const params = {
            Bucket: process.env.S3_BUCKET,//'cyclic-graceful-deer-fedora-ap-southeast-2',
            Prefix: `${folderString}`
        };

        //console.log("Params " + params.Prefix)

        const data = await s3.listObjectsV2(params).promise();

        var out = [];
        for (obj of data.Contents) {
            console.log(obj.Key)
            out.push(obj.Key);
        }
        res.send(out)

    });
}


