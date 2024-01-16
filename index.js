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

  var corsOptions = {
    origin: ['https://www.google.com', "https://localhost:7171", 'https://ffarquar.github.io'],
    credentials: true };
  
app.use(cors(corsOptions));

app.get("/api/admin", adminAuth, (req, res) => res.send("Admin Route reache with admin user"));
app.get("/api/basic", userAuth, (req, res) => res.send("User Route"));

app.use(express.json());

app.use("/api/auth", require("./Auth/Route"))
app.use( cookieParser());

require('dotenv').config();



require('./apis/trips.js')(app);

require('./apis/bikes.js')(app);

require('./apis/chains.js')(app);
require('./apis/notes.js')(app);
//require('./apis/testupload.js')(app);
//require('./apis/savetojws.js')(app);
//require('./apis/testusingcycl.shs3fs.js')(app);
//require('./apis/test_Aws_Session_Tok.js')(app); //this module works, refied by next version
require('./apis/test_Aws_Session_2.js')(app);



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


db().then(() => {
  app.listen(PORT, ()=> {
    console.log("Listening for requests");
  })
});




