
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const Schema = mongoose.Schema;

const cors = require('cors');
const { adminAuth, userAuth } = require("./middleware/auth.js");

mongoose.set('strictQuery', false);
require('dotenv').config();
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(express.static("public"));

const db = async () => {
    try {
  
      const dbstring = "mongodb+srv://"+ process.env.MongoDB_User + ":" + process.env.MongoDB_Password +"@" + process.env.MongoDB_Cluster +"/"+ process.env.MongoDB_DB_Name;
  
      console.log("dbstring = " + dbstring);
      const conn = await mongoose.connect(dbstring);
    
      module.exports = conn;
  
      console.log("MonoDB Connected: " + await conn.connection.host);
        
      } catch (error) {
      console.log(error);
      process.exit(1);
    }
    
  }

db().then(() => {
    app.listen(PORT, ()=> {
      console.log("Listening for requests");
    })
  });

  app.get("/test", async function(req, res) {


/*       const chainSchema = Schema({
        Id: Number,
        Brand: String,
        Model: String,
        DatePurchashed: Date,  
        Cost: Number,
        ChainLetter: String,
        IamgeUrl: String,
        PurchasedFrom: String,
        CurrentRotation:Number,
        BikeId:Number
 
      }); */

      const tripSchema = Schema({
        Id: Number,
        ChainId: Number,
        Date: Date,
        TripDistance: Date,  
        ChainRotation: Number,
        TripDescription: String,
        TripNotes: String,
        Chains: [{type: mongoose.Schema.Types.ObjectId, ref: "chainSchema"}]        
      });

    const Trip_m = mongoose.model("trips", tripSchema);

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
        "$project": {
          "_id": 0,
          "Id": 1,
          "ChainId": 1,
          "Date": 1,
          "TripDistance": 1,
          "ChainRotation": 1,
          "TripDescription": 1,
          "TripNotes": 1,
          "ChainDetails": {
            "$filter": {
              "input": "$ChainDetails",
              "as": "s",
              "cond": {
                "$eq": [
                  "$$s.BikeId",
                  2
                ]
              }
            }
          }
        }
      }
    ]);
    
    //The results that come from MongoDB are not in a format (there is a trip object with a chain object as a property). I only want the ChainLetter
    // out of the chain object, so I just get that.

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
  
