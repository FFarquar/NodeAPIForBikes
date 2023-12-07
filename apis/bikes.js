const express = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const app = express();


const bikesSchema = new Schema({
  Id: Number,
  Brand: String,
  Cost: Number,
  DatePurchased: String,  
  ImageURL: String,
  Model: String,
  Notes: String,
  PurchasedFrom: String,
  WarrantyPeriodYears: Number,
  Year: Number
});



const Bike_m = mongoose.model("bike", bikesSchema);
module.exports = function(app){

    //An api call to get all trips
        app.get('/bikes', async function(req, res){
            const filter = {};  
            const bikes = await Bike_m.find(filter);
            
            res.send(bikes);
        });
    
        //other routes..

        app.get("/bike/:bikeid", async function (req, res)  {
            //get a bike using bike Id
            
            console.log("In app.get(/bike/:bike ");
            console.log("   req.params.bikeid = "  + req.params.bikeid);
          
            bikeID = req.params.bikeid;
            console.log("bikeId variable  =  " + bikeID);
          
            const bike = await Bike_m.find({Id:bikeID});
          
            res.send(bike);
          
          
          });
}


