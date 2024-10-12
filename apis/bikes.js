const express = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const app = express();
const { adminAuth, userAuth } = require("../middleware/auth.js");

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
module.exports = function (app) {

  //An api call to get all bikes
  app.get('/api/bikes', userAuth, async function (req, res) {
    const filter = {};
    const bikes = await Bike_m.find(filter);
    console.log("In /bikes");
    console.log("bikes details =  " + bikes);
    res.send(bikes);
  });

  //other routes..
  app.get("/api/bikes/bike/:bikeid", async function (req, res) {
    //get a bike using bike Id

    //console.log("In app.get(/bike/:bike ");
    //console.log("   req.params.bikeid = "  + req.params.bikeid);

    bikeID = req.params.bikeid;
    //console.log("bikeId variable  =  " + bikeID);

    //const bike = await Bike_m.find({Id:bikeID});
    const bike = await Bike_m.findOne({ Id: bikeID }, { _id: 0 });
    //console.log("bike details =  " + bike);
    res.send(bike);
    //res.send(JSON.stringify(bike));


  });

  app.post('/api/bikes/addbike', adminAuth, async function (req, res) {
    console.log(req.body)

    const bike = new Bike_m({
      Id: await getNextBikeId(),
      Brand: req.body.Brand,
      Cost: req.body.Cost,
      DatePurchased: req.body.DatePurchased,
      ImageURL: req.body.ImageURL,
      Model: req.body.Model,
      Notes: req.body.Notes,
      PurchasedFrom: req.body.PurchasedFrom,
      WarrantyPeriodYears: req.body.WarrantyPeriodYears,
      Year: req.body.Year
    })

    console.log("Details of bike after being added adding " + bike)
    await bike.save()
    res.send(bike)
  });

  async function getNextBikeId() {

    console.log("In get next bike ID")
    result = await Bike_m.find();

    console.log("Bikes found = " + result.length)

    largestId = 0
    if (result.length > 0) {

      for (let index = 0; index < result.length; index++) {
        const element = result[index];
        console.log("BikeID = " + element.Id + " Largest ID = " + largestId)
        if (Number(element.Id) > Number(largestId)) {
          console.log("RESTTING ID to " + element.Id)
          largestId = Number(element.Id)

        }
      }
    }
    console.log("Largest value = " + largestId);
    console.log("Next number = " + Number(largestId + 1))
    return largestId + 1;
  };
};


