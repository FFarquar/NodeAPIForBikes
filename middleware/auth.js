const jwt = require("jsonwebtoken")
//const jwtSecret =  "4715aed3c946f7b0a38e6b534a9583628d84e96d10fbc04700770d572af3dce43625dd"

exports.adminAuth = (req, res, next) => {
  //const token = req.cookies.jwt
 
  //const {token} = req.query;
  console.log(JSON.stringify(req.headers));
  var tokenraw = req.headers['authorization'];
  var token = tokenraw.replace("Bearer ","");

  console.log("In adminauth");
  console.log("Token = " + token);
  
  
  if (token) {
    jwt.verify(token, process.env.jwtSecret, (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ message: "Not authorized" })
      } else {
        if (decodedToken.role !== "admin") {
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
    const token = req.cookies.jwt
    if (token) {
      jwt.verify(token, process.env.jwtSecret, (err, decodedToken) => {
        if (err) {
          return res.status(401).json({ message: "Not authorized" })
        } else {
          if (decodedToken.role !== "Basic") {
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