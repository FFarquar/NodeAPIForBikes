const express = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const app = express();
const { adminAuth, userAuth} = require("../middleware/auth.js");
//const moment = require('moment');

//Mongo is a pain in the arse in that it makes saving things like birthdates difficult as it adds in timezones.
//A lot of sites said to save the date as a string, but that made reading and sorting difficult. This led
//me to create 2 schemas, 1 for saving usign a string, and 1 for reading using a Date. Some casting has to be done to the date
const tripSchema = Schema({
    Id: Number,
    ChainId: Number,
    Date: String,
    TripDistance: Number,  
    ChainRotation: Number,
    TripDescription: String,
    TripNotes: String,

  });
  const Trip_m = mongoose.model("writetrips", tripSchema, "trips");

  const tripReadSchema = Schema({
    Id: Number,
    ChainId: Number,
    Date: Date,
    TripDistance: Number,  
    ChainRotation: Number,
    TripDescription: String,
    TripNotes: String,

  });
  const Trip_m_Read = mongoose.model("readtrips", tripReadSchema, "trips");



module.exports = function(app){

    //An api call to get all trips for all bikes
    app.get('/api/trips/getalltrips', userAuth, async function(req, res){
        console.log("In trips route");

        const result = await Trip_m_Read.aggregate([
          {
            $sort: { Date: 1 }
          },
          {
            $lookup: {
              from: "chains",
              localField: "ChainId",
              foreignField: "Id",
              as: "ChainDetails"
            }
          },
          {
            $project: {
              "_id": 1,
              "Id": 1,
              "ChainId": 1,
              "Date": 1,
              "TripDistance": 1,
              "ChainRotation": 1,
              "TripDescription": 1,
              "TripNotes": 1,
              "ChainDetails": 1
            }
          }
        ]);

        var resultsToReturn = [];
        result.forEach(element => {
          if(element.ChainDetails.length != 0)
          {
            
            const obj = {"Id": element.Id, "ChainId":element.ChainId, "ChainLetter": element.ChainDetails[0].ChainLetter,
            "ChainRotation" : element.ChainRotation, "Date" : new Date(element.Date),
            "TripDescription" : element.TripDescription,"TripDistance" : element.TripDistance, "TripNotes" : element.TripNotes,
            "_id" : element._id};
    
            resultsToReturn.push(obj)
          }
          
        });
        
        resultsToReturn.sort(compAsc);

        res.send(resultsToReturn);
      });
           
        
    //Get all trips for a bike
    app.get('/api/trips/gettripsforbike/:bikeid', userAuth, async function(req, res){
      
      bikeid = req.params.bikeid
      console.log("Bileid = " + bikeid)

    
    //This site had the answer on how to use the find in Mongoose
    //https://stackoverflow.com/questions/62025750/mongoose-find-and-lookup
        const result = await Trip_m_Read.aggregate([
          {
            $sort: { Date: 1 }
          },          
          {
            $lookup: {
              from: "chains",
              localField: "ChainId",
              foreignField: "Id",
              as: "ChainDetails"
            }
          },
          {
            $project: {
              "_id": 1,
              "Id": 1,
              "ChainId": 1,
              "Date": 1,
              "TripDistance": 1,
              "ChainRotation": 1,
              "TripDescription": 1,
              "TripNotes": 1,
              "ChainDetails": {
                $filter: {
                  "input": "$ChainDetails",
                  "as": "s",
                  "cond": {
                    $eq: [
                      "$$s.BikeId",
                      parseInt(bikeid)
                    ]
                  }
                }
              }
            }
          }
        ]);
        
        //The results that come from MongoDB are not in a format (there is a trip object with a chain object as a property) I want to return. 
        //I only want the ChainLetterout of the chain object, so I just get that.
    
        var resultsToReturn = [];
        result.forEach(element => {
          if(element.ChainDetails.length != 0)
          {
            
             const obj = {"Id": element.Id, "ChainId":element.ChainId, "ChainLetter": element.ChainDetails[0].ChainLetter,
            "ChainRotation" : element.ChainRotation, "Date" : new Date(element.Date),
            "TripDescription" : element.TripDescription,"TripDistance" : element.TripDistance, "TripNotes" : element.TripNotes,
            "_id" : element._id};
            console.log(element.Date)
            resultsToReturn.push(obj)
          }
          
        });

        //resultsToReturn.sort((a, b) => a.Date > b.Date);
        resultsToReturn.sort(compAsc);
        
        res.send(resultsToReturn);
      });

    function compAsc(a, b) {
        return new Date(b.Date).getTime() - new Date(a.Date).getTime();
    }

    //This comparison taken from https://jsbin.com/ipatok/8/edit?html,js,output
    function compDesc(a, b) {
        return new Date(a.Date).getTime() - new Date(b.Date).getTime();
    }
      //Add a trip
    app.post('/api/trips/addtrip', adminAuth, async function(req, res){
      //console.log("date received from API = " + req.body.Date)
      const trip = new Trip_m({
        ChainId: req.body.ChainId,
        Date: req.body.Date,
        TripDistance: req.body.TripDistance,  
        ChainRotation: req.body.ChainRotation,
        TripDescription: req.body.TripDescription,
        TripNotes: req.body.TripNotes        
      })

      console.log("date parse when saving = " + trip.Date)
      await trip.save()
      res.send(trip)


    });

    //Updated a trip
    app.patch('/api/trips/updatetrip', adminAuth, async function(req, res){


        const filter = {_id: req.body._id};
        const update = {_id: req.body._id, TripNotes: req.body.TripNotes, Id: req.body.Id, ChainId: req.body.ChainId,
        Date: req.body.Date, TripDistance: req.body.TripDistance, ChainRotation: req.body.ChainRotation,
        TripDescription: req.body.TripDescription, TripNotes: req.body.TripNotes, ChainDetails: req.body.ChainDetails};

        //console.log("Update data = " + update.Stringify());
        let doc = await Trip_m.findOneAndUpdate(filter, update);
        doc = await Trip_m.findOne(filter);
        console.log("Result of update = " + doc);
        res.send(doc);
      });

    //delete a trip
    app.delete('/api/trips/deletetrip/:tripid',adminAuth, async function(req, res){

      const filter = {_id: req.params.tripid};
      console.log("ID to delete = " + req.params.tripid);
      //console.log("Update data = " + update.Stringify());
      let testFind = await Trip_m.findOne(filter);
      if (testFind == null) {
        res.status(400).json({
          message: "Item not found. Delete not done",
          deleted: "false",
        });
      }

      let doc = await Trip_m.deleteOne(filter);
      doc = await Trip_m.findOne(filter);
      console.log("Result of delete = " + doc);
      if (doc == null) {
        res.status(200).json({
          message: "Deleted",
          deleted: "true",
        });
      }else
      {
        res.status(400).json({
          message: "Not deleted",
          deleted: "false",
        })
      }
      
    });

    //get a trip
    app.get('/api/trips/getatrip/:tripid', userAuth, async function(req, res){
      
      const filter = {_id: req.params.tripid};
      //console.log("ID of trip to get = " + req.params.tripid);

      let doc = await Trip_m_Read.findOne(filter);
      //TODO: if trip not fiound, this is causing an error
      if(doc == null)
      {
        console.debug("doc is null");
        res.send(doc);
      }        
      else
      {
        doc.Date = new Date(doc.Date);
        // date is a Date object you got, e.g. from MongoDB
  
        res.send(doc);
  
      }
    });

    //ReturnListOfChainRotationsForChain
    app.get('/api/trips/listofChainRotForChain/:chainid', userAuth, async function(req, res){
      
      //const filter = {ChainId: req.params.chaind};
      console.log("Chain Id of chain = " + req.params.chainid);

      const result = await Trip_m_Read.aggregate([
        {
          $match: { ChainId: parseInt(req.params.chainid)}
        },
        {
          $group: {
            _id: "$ChainRotation",
            trips: {
              $push: "$$ROOT"
            }
          }
        }
      ]);

      //TODO: if trip not fiound, this is causing an error
      if(result == null)
      {
        console.debug("result is null");
        res.send(result);
      }        
      else
      {
        res.send(result);
      }
    });

    //ReturnList of trips for a chain on a specific rotation
    app.get('/api/trips/listofTripsForChainRotation/:chainid/:rotation', userAuth, async function(req, res){
  
      //query is to return a TripDTO object, comprising the following values
      //t = trip, c = ChainLetter
/*        t.Id,
      c.ChainLetter,
      t.ChainId,
      t.Date,
      t.TripDistance,
      t.ChainRotation,
      t.TripDescription,
      t.TripNotes */

      //const filter = {ChainId: req.params.chaind};
      console.log("Chain Id  = " + req.params.chainid);
      console.log("Rotation  = " + req.params.rotation);

      const result = await Trip_m_Read.aggregate([
        {$match: {"$and":[{ ChainId: parseInt(req.params.chainid)},
                  {ChainRotation: parseInt(req.params.rotation)}] }
        },
        {
          $sort: { Date: 1 }
        },
        {
          $lookup: {
            from: "chains",
            localField: "ChainId",
            foreignField: "Id",
            as: "ChainDetails"
          }
        },
        {
          $project: {"BikeId": 0, "PurchasedFrom": 0}
        }
      ]);
      //Cant work out how to exclude fields from the chain object. Have to remove them below (the project pipeline is not working)

      var resultsToReturn = [];
      result.forEach(element => {
        if(element.ChainDetails.length != 0)
        {
          
          const obj = {"Id": element.Id, "ChainId":element.ChainId, "ChainLetter": element.ChainDetails[0].ChainLetter,
          "ChainRotation" : element.ChainRotation, "Date" : new Date(element.Date),
          "TripDescription" : element.TripDescription,"TripDistance" : element.TripDistance, "TripNotes" : element.TripNotes,
          "_id" : element._id};
  
          resultsToReturn.push(obj)
        }
        
      });          

      //resultsToReturn.sort((a, b) => a.Date > b.Date);
      resultsToReturn.sort(compAsc);
      
      res.send(resultsToReturn);
    });
    //other routes..
}