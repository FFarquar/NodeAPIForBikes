const jwt = require("jsonwebtoken")
//const jwtSecret =  "4715aed3c946f7b0a38e6b534a9583628d84e96d10fbc04700770d572af3dce43625dd"


exports.adminAuth = (req, res, next) => {
 
  console.log("In adminauth");
  console.log(JSON.stringify(req.headers));

  //The token is contained in header called 'authorization'
  var tokenraw = req.headers['authorization'];
  if(tokenraw == null)
  {
    console.log("No token received in admin auth");
    return res.status(401).json({ message: "Not authorized" })
  }
  var token = tokenraw.replace("Bearer ","");

  console.log("Token = " + token);
  

  if (token) {
    jwt.verify(token, process.env.jwtSecret, (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ message: "Not authorized" })
      } else {
        if (decodedToken.role !== "admin") {
          console.log("Token issue. Not an admin");
          return res.status(401).json({ message: "Not authorized" })
        } else {
          next()
        }
      }
    })
  } else {
    return res
      .status(401)
      .json({ message: "Not authorized, token not available" })
  }
}

exports.userAuth = (req, res, next) => {
  //console.log("In user Auth");
  //The token is contained in header called 'authorization'
  var tokenraw = req.headers['authorization'];
  if(tokenraw == null)
  {
    console.log("No token received in user auth 111");
    return res.status(401).json({ message: "Not authorized" })
  }
  var token = tokenraw.replace("Bearer ","");  
    //const token = req.cookies.jwt
    if (token) {
      jwt.verify(token, process.env.jwtSecret, (err, decodedToken) => {
        if (err) {
          return res.status(401).json({ message: "Not authorized" })
        } else {
          //console.log("User role = " + decodedToken.role)
          if (decodedToken.role !== "user" && decodedToken.role !== "admin") {
            console.log("Token issue. Not user level access");
            return res.status(401).json({ message: "Not authorized" })
          } else {
            next()
          }
        }
      })
    } else {
      return res
        .status(401)
        .json({ message: "Not authorized, token not available" })
    }
  }