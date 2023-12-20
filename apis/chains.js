const express = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const app = express();


const chainSchema = new Schema({
  Id: Number,
  Brand: String,
  Model: Number,
  DatePurchased: String,  
  Cost:Number,
  ChainLetter: String,
  ImageURL: String,
  PurchasedFrom: String,
  CurrentRotation: Number,
  BikeId: Number

});

const Chain_M = mongoose.model("chains", chainSchema);

module.exports = function(app){

    app.get('/chains/:bikeid', async function(req, res){

        bikeID = req.params.bikeid;

        const result = await Chain_M.aggregate([
            {
                $match: {BikeId: parseInt(bikeID)},
            },
            {
              $lookup: {
                from: "trips",
                localField: "Id",
                foreignField: "ChainId",
                as: "TripDetails"
              }
            }
          ]); 

        //Need to get the total distance that each chain has travelled
        //and the number of trips taken

          var resultsToReturn = [];
          result.forEach(element => {
            if(element.TripDetails.length != 0)
            {
                var distanceTravelled = 0
                for (let index = 0; index < element.TripDetails.length; index++) {
                    distanceTravelled = distanceTravelled + element.TripDetails[index].TripDistance;
                }

              const obj = {"Id": element.Id, "Brand":element.Brand, "Model": element.Model,
              "DatePurchased" : element.DatePurchased, "Cost" : element.Cost, "ChainLetter" : element.ChainLetter,
              "ImageUrl" : element.ImageURL, "PurchasedFrom" : element.PurchasedFrom, "CurrentRotation" : element.CurrentRotation,
              "BikeId" : element.BikeId, "TripsTake" : element.TripDetails.length, "DistanceTravelled" :  distanceTravelled};
      
              //console.log(obj)
              resultsToReturn.push(obj)
            }
            
          });
          res.send(resultsToReturn);
        //res.send(result);
    });

};