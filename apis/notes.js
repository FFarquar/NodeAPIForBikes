const express = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const app = express();
const { adminAuth, userAuth} = require("../middleware/auth.js");

//Mongo is a pain in the arse in that it makes saving things like birthdates difficult as it adds in timezones.
//A lot of sites said to save the date as a string, but that made reading and sorting difficult. This led
//me to create 2 schemas, 1 for saving usign a string, and 1 for reading using a Date. Some casting has to be done to the date

const noteWriteSchema = Schema({
    BikeId: Number,
    Date: String,
    Note: String,
    UploadResult:[
      {
        Uploaded:Boolean,
        FileName :String,
        StoredFileName : String,
        ServerPath : String,
        ErrorCode : Number,
        MimeType : String,
        Size : Number
      }
    ]    
  });
  const Note_m_Write = mongoose.model("writenotes", noteWriteSchema, "notes");

  const noteReadSchema = Schema({
    Id: Number,
    BikeId: Number,
    Date: Date,
    Note: String,
  });

  const Note_m_Read = mongoose.model("readnotes", noteReadSchema, "notes");

  module.exports = function(app){

        
/*     //Get all notes for a bike (NO AUTH)
    app.get('/api/notes/getnotesforabike/:bikeid', async function(req, res){
      
      bikeid = req.params.bikeid
      console.log("bikeid = " + bikeid)
    
    //This site had the answer on how to use the find in Mongoose
    //https://stackoverflow.com/questions/62025750/mongoose-find-and-lookup
        const filter = {BikeId: bikeid};  
        const result = await Note_m_Read.find(filter);

        //The results that come from MongoDB are not in a format (there is a trip object with a chain object as a property) I want to return. 
        //I only want the ChainLetterout of the chain object, so I just get that.
        console.log(result)
        var resultsToReturn = [];

        result.forEach(element => {
            const obj = {"Id": element.Id, "BikeId":element.BikeId, "Date" : new Date(element.Date),
            "Note" : element.Note, "_id" : element._id};
            
            //console.log(element.Date)
            resultsToReturn.push(obj)            
        });  
        resultsToReturn.sort(compAsc);
        
        res.send(resultsToReturn);
      }); */

    //Get all notes for a bike (USING AUTH)
    app.get('/api/notes/getnotesforabike/:bikeid', userAuth, async function(req, res){
      
      bikeid = req.params.bikeid
        
    //This site had the answer on how to use the find in Mongoose
    //https://stackoverflow.com/questions/62025750/mongoose-find-and-lookup
        const filter = {BikeId: bikeid};  
        const result = await Note_m_Read.find(filter);

        //The results that come from MongoDB are not in a format (there is a trip object with a chain object as a property) I want to return. 
        //I only want the ChainLetterout of the chain object, so I just get that.
        //console.log(result)
        var resultsToReturn = [];

        result.forEach(element => {
            const obj = {"Id": element.Id, "BikeId":element.BikeId, "Date" : new Date(element.Date),
            "Note" : element.Note, "_id" : element._id};
            
            //console.log(element.Date)
            resultsToReturn.push(obj)            
        });  
        resultsToReturn.sort(compAsc);
        
        res.send(resultsToReturn);
      });

      //Add a note (auth)
      app.post('/api/notes/addnote', adminAuth, async function(req, res){
        //console.log("date received from API = " + req.body.Date)
        console.log(req.body)
        const note = new Note_m_Write({
          Note: req.body.Note,
          Date: req.body.Date,
          BikeId: req.body.BikeId,
          UploadResult: req.body.UploadResult
        })
  
        //console.log("date parse when saving = " + trip.Date)
        await note.save()
        res.send(note)
  
  
      });      

    function compAsc(a, b) {
        return new Date(b.Date).getTime() - new Date(a.Date).getTime();
    }

    //This comparison taken from https://jsbin.com/ipatok/8/edit?html,js,output
    function compDesc(a, b) {
        return new Date(a.Date).getTime() - new Date(b.Date).getTime();
    }

    //get a note
    app.get('/api/notes/getanote/:noteid', userAuth, async function(req, res){
      
        const filter = {_id: req.params.noteid};
        console.log("ID of note to get = " + req.params.noteid);
  
        let doc = await Note_m_Read.findOne(filter);

        //TODO: if note not fiound, this is causing an error
        if(doc == null)
        {
          console.debug("doc is null");
          res.send(doc);
        }        
        else
        {
            doc.Date = new Date(doc.Date);
            res.send(doc);
        }
  
        
      });


    //Test delete usign verification. Only an admin can delete stuff
    app.delete('/api/notes/deletenote/:noteid', adminAuth, async function(req, res){
      // Accessible only by users with a valid JWT token
      const filter = {_id: req.params.noteid};
      console.log("ID to delete = " + req.params.noteid);
      //console.log("Update data = " + update.Stringify());
      let testFind = await Note_m_Read.findOne(filter);
      if (testFind == null) {
          return res.status(400).json({
          message: "Item not found. Delete not done",
          deleted: "false",
          });
      }
  
      let doc = await Note_m_Read.deleteOne(filter);
      doc = await Note_m_Read.findOne(filter);
      console.log("Result of delete = " + doc);
      if (doc == null) {
          return res.status(200).json({
          message: "Deleted",
          deleted: "true",
          });
      }else
      {
          return res.status(400).json({
          message: "Not deleted",
          deleted: "false",
          })
      }
     });

    //Update a note
    app.patch('/api/notes/updatenote', adminAuth, async function(req, res){


        const filter = {_id: req.body._id};
        const update = {_id: req.body._id, Date: req.body.Date, Note: req.body.Note, BikeId: req.body.BikeId};

        //console.log("Update data = " + update.Stringify());
        let doc = await Note_m_Write.findOneAndUpdate(filter, update);
        doc = await Note_m_Write.findOne(filter);
        //console.log("Result of update = " + doc);
        res.send(doc);
      });    
    //other routes..

}