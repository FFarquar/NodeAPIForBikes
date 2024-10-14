const Mongoose = require("mongoose")

const chainSchema = new Mongoose.Schema({
    Id: Number,
    Brand: String,
    Model: String,
    DatePurchased: String,
    Cost: Number,
    ChainLetter: String,
    ImageURL: String,
    PurchasedFrom: String,
    CurrentRotation: Number,
    BikeId: Number
  
  });

const chains = Mongoose.model("chains", chainSchema)
module.exports = chains