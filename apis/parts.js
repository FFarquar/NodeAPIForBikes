const express = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const app = express();
const { adminAuth, userAuth} = require("../middleware/auth.js");

//Mongo is a pain in the arse in that it makes saving things like birthdates difficult as it adds in timezones.
//A lot of sites said to save the date as a string, but that made reading and sorting difficult. This led
//me to create 2 schemas, 1 for saving usign a string, and 1 for reading using a Date. Some casting has to be done to the date

const partWriteSchema = Schema({
    bikeId: Number,
    Name: String,
    Cost: Number,
    DatePurchased: String,
    PurchasedFrom: String,
    Notes: String,
    UploadResult:[
      {
        Uploaded:String, //IF this is a boolean, the converter in the client app cant desiarlize
        FileName :String,
        StoredFileName : String,
        ServerPath : String,
        ErrorCode : Number,
        MimeType : String,
        Size : Number
      }
    ]
  });

  const Part_m_Write = mongoose.model("writeparts", partWriteSchema, "parts");

  const partReadSchema = Schema({
    bikeId: Number,
    Name: String,
    Cost: Number,
    DatePurchased: String,
    PurchasedFrom: String,
    Notes: String,
    UploadResult:[
      {
        Uploaded:String, //IF this is a boolean, the converter in the client app cant desiarlize
        FileName :String,
        StoredFileName : String,
        ServerPath : String,
        ErrorCode : Number,
        MimeType : String,
        Size : Number
      }
    ]
  });

  const Part_m_Read = mongoose.model("readparts", partReadSchema, "parts");

  module.exports = function(app){

        //Get all parts for a bike (USING AUTH)
        app.get('/api/parts/getpartsforabike/:bikeid', userAuth, async function(req, res){
            console.log("In getpartsfor a bike")
            bikeid = req.params.bikeid
            //console.log("Bike ID = " + bikeid)
              const filter = {bikeId: bikeid};  
              const result = await Part_m_Read.find(filter);
      
              //I want to be able to sort and ignore some of the values
              //console.log(result)
              var resultsToReturn = [];
      
              result.forEach(element => {
                  const obj = {"_id":element._id, "bikeId":element.bikeId, "Name" : element.Name, "Cost" : element.Cost, "DatePurchased" :  element.DatePurchased,
                  "PurchasedFrom" : element.PurchasedFrom, "Notes" : element.Notes, "UploadResult" : element.UploadResult}
                  
                  resultsToReturn.push(obj)            
              });  
      
              resultsToReturn.sort(compAsc);
      
              res.send(resultsToReturn);
            });

      //Add a part 
      app.post('/api/parts/addpart', adminAuth, async function(req, res){
        //console.log("date received from API = " + req.body.Date)
        //THIS IS NOT COMPLETE
        console.log(req.body)
        const part = new Part_m_Write({
          bikeId: req.body.bikeId,
          Name: req.body.Name,
          Cost: req.body.Cost,
          DatePurchased: req.body.DatePurchased,
          PurchasedFrom: req.body.PurchasedFrom,
          Notes: req.body.Notes,
          UploadResult: req.body.UploadResult
        })
  
        console.log("Details of part after adding " + part)
        await part.save()
        res.send(part)
  
  
      });               

    //get a part
    app.get('/api/parts/getapart/:partid', userAuth, async function(req, res){
      
      const filter = {_id: req.params.partid};
      console.log("ID of part to get = " + filter._id);

      let doc = await Part_m_Read.findOne(filter);

      //console.log("Part details " + doc)

      if(doc == null)
      {
        console.debug("no part found");
        res.send(doc);
      }        
      else
      {
          doc.Date = new Date(doc.Date);
          //console.log("response from get a part = " + doc);            
          res.send(doc);
      }

      
    });

    //Delete a part
    app.delete('/api/parts/deletepart/:partid', adminAuth, async function(req, res){
      // Accessible only by users with a valid JWT token
      const filter = {_id: req.params.partid};
      console.log("ID to delete = " + req.params.noteid);

      let testFind = await Part_m_Read.findOne(filter);
      if (testFind == null) {
          return res.status(400).json({
          message: "Item not found. Delete not done",
          deleted: "false",
          });
      }
  
      let doc = await Part_m_Read.deleteOne(filter);
      doc = await Part_m_Read.findOne(filter);
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

     app.patch('/api/parts/updatepart', adminAuth, async function(req, res){
      //console.log("In updatepart");
      const filter = {_id: req.body._id};
      const update = {_id: req.body._id, bikeId: req.body.bikeId, Name: req.body.Name, Cost: req.body.Cost, DatePurchased: req.body.DatePurchased, PurchasedFrom: req.body.PurchasedFrom, Notes: req.body.Notes, UploadResult: req.body.UploadResult};

      //console.log("  _id = " + filter._id);
      let doc = await Part_m_Write.findOneAndUpdate(filter, update);
      doc = await Part_m_Write.findOne(filter);
      //console.log("Result of update = " + doc);
      res.send(doc);
    });         
     
    function compAsc(a, b) {
        return new Date(b.DatePurchased).getTime() - new Date(a.DatePurchased).getTime();
    }

    function compDesc(a, b) {
        return new Date(a.DatePurchased).getTime() - new Date(b.DatePurchased).getTime();
    }
  }