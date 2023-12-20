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
            console.log("In /bikes");
            console.log("bikes details =  " + bikes);
            res.send(bikes);
        });
    
        //other routes..

        app.get("/bike/:bikeid", async function (req, res)  {
            //get a bike using bike Id
            
            //console.log("In app.get(/bike/:bike ");
            //console.log("   req.params.bikeid = "  + req.params.bikeid);
          
            bikeID = req.params.bikeid;
            //console.log("bikeId variable  =  " + bikeID);
          
            //const bike = await Bike_m.find({Id:bikeID});
            const bike = await Bike_m.findOne({Id:bikeID},{_id:0});
            //console.log("bike details =  " + bike);
            res.send(bike);
            //res.send(JSON.stringify(bike));
          
          
          });
}


