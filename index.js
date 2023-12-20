//This is an example of setting up an API
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
//const ejs = require("ejs");
//const stringify = require("json-stringify");
//const { bindAll } = require("lodash");

const cors = require('cors');
const { adminAuth, userAuth } = require("./middleware/auth.js");

mongoose.set('strictQuery', false);
const PORT = process.env.PORT || 3000;

const app = express();
/* app.use(cors({
  origin: '*'
})); */

/* 
app.use(cors({
    allowedHeaders: ["authorization", "Content-Type"], // you can change the headers
    exposedHeaders: ["authorization"], // you can change the headers
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false
})); */

/* app.use(cors({
    origin: ['https://www.google.com', "https://localhost:7171", 'https://ffarquar.github.io/TestFromGitToMongo'],
    preflightContinue: false,
}));
app.use(function (request, response, next) {
  response.setheader('Access-Control-Allow-Origin', 'https://ffarquar.github.io/TestFromGitToMongo');
  response.setheader('Access-Control-Allow-Credentials', 'https://ffarquar.github.io/TestFromGitToMongo');
  response.setheader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
 */

/* var corsOptions = {
    origin: ['https://www.google.com', "https://localhost:7171", 'https://ffarquar.github.io/TestFromGitToMongo'],
    credentials: true };
 */
  var corsOptions = {
    origin: ['https://www.google.com', "https://localhost:7171", 'https://ffarquar.github.io'],
    credentials: true };
  
app.use(cors(corsOptions));

app.get("/admin", adminAuth, (req, res) => res.send("Admin Route reache with admin user"));
app.get("/basic", userAuth, (req, res) => res.send("User Route"));

app.use(express.json());

app.use("/api/auth", require("./Auth/Route"))
app.use( cookieParser());

require('dotenv').config();

require('./apis/trips.js')(app);

require('./apis/bikes.js')(app);






//app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

console.log("TODO: up to creating Rego form. To be done from Blazor. https://www.loginradius.com/blog/engineering/guest-post/nodejs-authentication-guide/")
app.use(express.static("public"));


const db = async () => {
  try {


    const dbstring = "mongodb+srv://"+ process.env.MongoDB_User + ":" + process.env.MongoDB_Password +"@" + process.env.MongoDB_Cluster +"/"+ process.env.MongoDB_DB_Name;

    const conn = await mongoose.connect(dbstring);


    //const conn = await mongoose.connect('mongodb+srv://DD_1:DD_1_PW@cluster1.eiy6kz9.mongodb.net/BikeDB');
    module.exports = conn;

    console.log("MonoDB Connected: " + await conn.connection.host);
      
    } catch (error) {
    console.log(error);
    process.exit(1);
  }
  
}


/* 
const Schema = mongoose.Schema;

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
/* const bikesSchema = new Schema({
  Brand: String,

});
 */

/* const Bike_m = mongoose.model("bike", bikesSchema);

app.get("/bikes", async function(req, res) {
//An api call to get bikes

  const filter = {};  
  const bikes = await Bike_m.find(filter);
  
  res.send(bikes);

});
 */
/* app.get("/bike/:bikeid", async function (req, res)  {
  //get a bike using bike Id
  
  console.log("In app.get(/bike/:bike ");
  console.log("   req.params.bikeid = "  + req.params.bikeid);

  bikeID = req.params.bikeid;
  console.log("bikeId variable  =  " + bikeID);

  const bike = await Bike_m.find({Id:bikeID});

  res.send(bike);


}); */

/* 

app.post("/", async function(req, res){

  const item = req.body.newItem;
  const listTitle = req.body.list;

  console.log("___________________");
  console.log("Posting new item");
  console.log("   Item text = " + item);
  console.log("   List name = " + listTitle);
  console.log("___________________");

  const lists = await Item_m.distinct("list", {"deleted":"false"});
  
  //listName is a stored variable
  const newItem = await Item_m.create({ list: listTitle, name: item, "$set":{"checked":false}, "$set":{"deleted":false}});
  const items = await Item_m.find({list:listTitle, deleted:false});

  res.render("simple_list_test", {listTitle: listTitle, newListItems: items, uniqueLists:lists});

//    res.redirect("/");
  

});

app.get("/addnewList", function (req, res)  {
  //create a new list with a new item in the list
  console.log("creating new list");

  res.render("newList", {listWarning: undefined, item: undefined});
  //res.render("newList");

  //res.redirect("/");
});

app.post("/addnewList", async function (req, res)  {
  //add new list and item
  console.log("creating new list");

  let listNewName = req.body.listname;
  let newItem1 = req.body.newItem;

//  console.log("Listname = " + listNewName);
//  console.log("Item = " + newItem1);

  if (listNewName == "" || newItem1 == "") {
    //no input, just bail back to home page

    res.redirect("/");
  } else {

      //dont want to add the new list if it exists already
    const items = await Item_m.find({list:listNewName, deleted:false});
    
    if (items.length > 0) {
      console.log("List exists");
      res.render("newList", {listWarning:listNewName, item:newItem1});
    }  else {

      const newItem = await Item_m.create({ list: listNewName, name: newItem1, "$set":{"checked":false}, "$set":{"deleted":false}});

      const items = await Item_m.find({list:listNewName, deleted:false});

      const lists = await Item_m.distinct("list", {"deleted":"false"});
    
      res.render("simple_list_test", {listTitle: listNewName, newListItems: items, uniqueLists:lists});

    }
  } 
});

app.get("/list/:list", async function (req, res)  {
  //get a different list
  
  console.log("In app.get(/list/:list ");
  console.log("   req.params.list = "  + req.params.list);

  listName = req.params.list;
  console.log("listName variable  =  " + listName);

  const items = await Item_m.find({list:listName, deleted:false});

  const lists = await Item_m.distinct("list", {"deleted":"false"});

  console.log("Rendering list directly from list/:list");
  
  res.render("simple_list_test", {listTitle: listName, newListItems: items, uniqueLists:lists});

});

//app.get("/itemChangeCheckedStatus/:item", function (req, res)  {


app.post("/itemChange", async function (req, res)  {

  console.log("*************");
  console.log("  In item change");

  let checkBoxID = req.body.changeCheckedStatus;

//  let deleteButtonID = req.body.deleteButton;

  console.log("Checkbox ID = " + checkBoxID);

  const newItemupdateItem = await Item_m.updateOne(
    { _id: checkBoxID },
    [ { "$set": { "checked": { "$eq": [false, "$checked"] } } } ]
    )
    //console.log("Count of updated records = " + newItemupdateItem.modifiedCount);

  const listTitle = req.body.listName;
  console.log("  List title = " + listTitle);
  const items = await Item_m.find({list:listTitle, deleted:false});
        
  const lists = await Item_m.distinct("list", {"deleted":"false"});
    
  res.render("simple_list_test", {listTitle: listTitle, newListItems: items, uniqueLists:lists});


});

app.post("/deleteItem/:item", async function (req, res)  {
  console.log("*************");
  console.log("  Item delete");
  let deleteButtonID = req.body.deleteButton;
  const listTitle = req.body.listName;
  console.log("  List title = " + listTitle);

  console.log("   Delete button = " + deleteButtonID);
  //mark the item as deleted
  const itemupdateItem = await Item_m.updateOne({ _id: deleteButtonID},  {"$set":{"deleted":true}})
  
  

  const items = await Item_m.find({list:listTitle, deleted:false});
        
  const lists = await Item_m.distinct("list", {"deleted":"false"});
    
 
 */


db().then(() => {
  app.listen(PORT, ()=> {
    console.log("Listening for requests");
  })
});




