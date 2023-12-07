const express = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const app = express();


const tripSchema = Schema({
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

const Trip_m = mongoose.model("trip", tripSchema);

console.log("TODO: Change trip schema and add trip details to Mongo")
/* app.get("/trips", async function(req, res) {
    //An api call to get all trips
    
      const filter = {};  
      const trips = await Trip_m.find(filter);
      
      res.send(trips);
    
    });
 */

module.exports = function(app){

    //An api call to get all trips
        app.get('/trips', async function(req, res){
            const filter = {};  
            const trips = await Trip_m.find(filter);
            
            res.send(trips);
        });
    
        //other routes..
}