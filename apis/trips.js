const express = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const app = express();


const tripSchema = Schema({
    Id: Number,
    ChainId: Number,
    Date: Date,
    TripDistance: Number,  
    ChainRotation: Number,
    TripDescription: String,
    TripNotes: String,

  });

/*   const tripSchema_DTO = Schema({
    Id: Number,
    ChainId: Number,
    Date: Date,
    TripDistance: Number,  
    ChainRotation: Number,
    TripDescription: String,
    TripNotes: String,
    ChainLetter: String

  });

  const chainSchema = Schema({
    Id: Number,
    Brand: String,
    Model: String,
    DatePurchased: Date,  
    Cost: Number,
    ChainLetter: String,
    ImageURL: String,
    PurchasedFrom: String,
    CurrentRotation: Number,
    BikeId: Number
  });
 */
const Trip_m = mongoose.model("trips", tripSchema);
//const Chain_m = mongoose.model("chains", chainSchema);
//const Trip_M_DTO = mongoose.model("chains", tripSchema_DTO);


module.exports = function(app){

    //An api call to get all trips for all bikes
        app.get('/trips', async function(req, res){
            console.log("In trips route");

            const result = await Trip_m.aggregate([
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
                  "_id": 0,
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
                "ChainRotation" : element.ChainRotation, "Date" : element.Date, 
                "TripDescription" : element.TripDescription,"TripDistance" : element.TripDistance, "TripNotes" : element.TripNotes};
        
                resultsToReturn.push(obj)
              }
              
            });
            res.send(resultsToReturn);
        });

        
    //Get all trips for a bike
    app.get('/trips/:bikeid', async function(req, res){
      
      bikeid = req.params.bikeid
      console.log("Bileid = " + bikeid)

    
    //This site had the answer on how to use the find in Mongoose
    //https://stackoverflow.com/questions/62025750/mongoose-find-and-lookup
        const result = await Trip_m.aggregate([
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
              "_id": 0,
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
            "ChainRotation" : element.ChainRotation, "Date" : element.Date, 
            "TripDescription" : element.TripDescription,"TripDistance" : element.TripDistance, "TripNotes" : element.TripNotes};
    
            resultsToReturn.push(obj)
          }
          
        });
        res.send(resultsToReturn);
      });

        //other routes..
}