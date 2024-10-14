const express = require("express");
// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;
const Chain_M = require("../model/Chain")
const app = express();
const { adminAuth, userAuth } = require("../middleware/auth.js");
//Chain model/schema out to a separate module so that the chain API could access it as well

// const chainSchema = new Schema({
//   Id: Number,
//   Brand: String,
//   Model: String,
//   DatePurchased: String,
//   Cost: Number,
//   ChainLetter: String,
//   ImageURL: String,
//   PurchasedFrom: String,
//   CurrentRotation: Number,
//   BikeId: Number

// });

// const Chain_M = mongoose.model("chains", chainSchema);



module.exports = function (app) {


  app.get('/api/chains/:bikeid', async function (req, res) {

    bikeID = req.params.bikeid;

    const result = await Chain_M.aggregate([
      {
        $match: { BikeId: parseInt(bikeID) },
      },
      {
        $sort: { ChainLetter: 1 }
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

    console.log(result)
    //Need to get the total distance that each chain has travelled
    //and the number of trips taken


    if (result.length > 0 && result[0].TripDetails.length > 0) {
      var resultsToReturn = [];
      result.forEach(element => {
        if (element.TripDetails.length != 0) {
          var distanceTravelled = 0
          for (let index = 0; index < element.TripDetails.length; index++) {
            distanceTravelled = distanceTravelled + element.TripDetails[index].TripDistance;
          }

          const obj = {
            "Id": element.Id, "Brand": element.Brand, "Model": element.Model,
            "DatePurchased": element.DatePurchased, "Cost": element.Cost, "ChainLetter": element.ChainLetter,
            "ImageUrl": element.ImageURL, "PurchasedFrom": element.PurchasedFrom, "CurrentRotation": element.CurrentRotation,
            "BikeId": element.BikeId, "TripsTake": element.TripDetails.length, "DistanceTravelled": distanceTravelled
          };

          //console.log(obj)
          resultsToReturn.push(obj)
        }
        else {
          //chain may have had no trips on it yet
          const obj = {
            "Id": element.Id, "Brand": element.Brand, "Model": element.Model,
            "DatePurchased": element.DatePurchased, "Cost": element.Cost, "ChainLetter": element.ChainLetter,
            "ImageUrl": element.ImageURL, "PurchasedFrom": element.PurchasedFrom, "CurrentRotation": element.CurrentRotation,
            "BikeId": element.BikeId, "TripsTake": element.TripDetails.length, "DistanceTravelled": 0
          };

          //console.log(obj)
          resultsToReturn.push(obj)

        }

      });

      res.send(resultsToReturn);
    } else {
      //if the chain has had no trips added, just return the result object
      res.send(result);
    }

    //res.send(result);
  });

  app.get('/api/chains/getchain/:chainid', async function (req, res) {

    chainId = req.params.chainid;

    const chain = await Chain_M.findOne({ Id: chainId });
    res.send(chain);

  });

  app.post('/api/chains/addchain', adminAuth, async function (req, res) {
    console.log(req.body)
    //an Id property is required as a legacy of it being a foreign key when transferred from SQL. 
    //Have to get the highest ID value and increment

    const chain = new Chain_M({
      Id: await getNextChainId(),
      Brand: req.body.Brand,
      Model: req.body.Model,
      DatePurchased: req.body.DatePurchased,
      Cost: req.body.Cost,
      ChainLetter: req.body.ChainLetter,
      ImageURL: req.body.ImageURL,
      PurchasedFrom: req.body.PurchasedFrom,
      CurrentRotation: req.body.CurrentRotation,
      BikeId: req.body.BikeId
    })

    console.log("Details of chain after being added adding " + chain)
    await chain.save()
    res.send(chain)
  });

  async function getNextChainId() {


    console.log("In get next chain ID")
    result = await Chain_M.find();

    //console.log("Chains found = " + result.length)

    largestId = 0
    if (result.length > 0) {

      for (let index = 0; index < result.length; index++) {
        const element = result[index];
        //console.log("ChainID = " + element.Id + " Largest ID = " + largestId)
        //console.log("ChainID = " + element.Id)
        if (Number(element.Id) > Number(largestId)) {
          console.log("RESTTING ID to " + element.Id)
          largestId = Number(element.Id)

        }
      }
    }
    //console.log("Largest value = " + largestId);
    //console.log("Next number = " + Number(largestId + 1))
    return largestId + 1;
  };


};