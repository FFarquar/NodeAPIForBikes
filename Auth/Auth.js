const User = require("../model/User")
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken')

exports.register = async (req, res, next) => {
  const { username, password, email } = req.body;


  /*     console.log("Register has been called");
      console.log("   ");
      console.log("USERNAME = " + username);
      console.log("Email = " + email);
      console.log("Password = " + password);
       */

  bcrypt.hash(password, 10).then(async (hash) => {
    await User.create({
      username,
      password: hash,
      email
    })
      .then((user) => {
        const maxAge = 14 * 24 * 60 * 60;
        const token = jwt.sign(
          { id: user._id, username, role: user.role },
          process.env.jwtSecret,
          {
            expiresIn: maxAge, // 14 days in sec
          }
        );
        console.log("Token created for " + username + " = " + token);
        //Blazor can't read cookies or headers, so have to set the token
        //in the response message and read it from that location

        /*           res.setHeader('Access-Control-Expose-Headers', "*");
                  res.setHeader('Access-Control-Allow-Origin', "*");
                        
                  res.setHeader('jwt', token);
        */
        /*           res.cookie("jwt", token, {
                    httpOnly: true,
                    maxAge: maxAge * 1000, // 14hrs in ms
                  }); */
        res.status(201).json({
          message: "User successfully created",
          user: user._id,
          token: token
        });
      })
      .catch((error) =>
        res.status(400).json({
          message: "User not successful created",
          error: error.message
        })
      );
  });
};

exports.login = async (req, res, next) => {
  const { username, password } = req.body
  console.log("In the login route");
  // Check if username and password is provided
  //TODO : IF user has already has an  access token, it needs to be blacklisted
  if (!username || !password) {
    return res.status(400).json({
      message: "Username or Password not present",
    })
  }
  try {
    const user = await User.findOne({ username })
    if (!user) {
      res.status(400).json({
        message: "Login not successful",
        error: "User not found",
      })
    } else {
      // comparing given password with hashed password
      bcrypt.compare(password, user.password).then(function (result) {
        if (result) {
          const maxAge = 14 * 24 * 60 * 60;
          const token = jwt.sign(
            { id: user._id, username, role: user.role },
            process.env.jwtSecret,
            {
              expiresIn: maxAge, // 14 days in sec
            }
          );

          //see note on register route as to why token isnt in cookie
          /*             res.cookie("jwt", token, {
                        httpOnly: true,
                        maxAge: maxAge * 1000, // 3hrs in ms
                      }); */

          //Testing delayed response when deployed to prod. Prod server can over 50 seconds to spin up
          //so implementing a fored delay to test front end
          // var datetime = new Date();
          // var timeToWaitTill = new Date(datetime.getTime() + (5000)); //wait 5 seconds before continuing

          // console.log("Current time = " + datetime)
          // console.log("Time to wait till = " + timeToWaitTill)

          // do {
          //   var currentTime = new Date();
          // } while (currentTime <= timeToWaitTill);
          // var timeAfterWait = new Date(); //wait 5 seconds before continuing
          // console.log("Finsiehd waiting = " + timeAfterWait)

          res.status(201).json({
            message: "User successfully Logged in",
            user: user._id,
            token: token

          });
        } else {
          res.status(400).json({ message: "Login not succesful" });
        }
      });
    }
  } catch (error) {
    res.status(400).json({
      message: "An error occurred",
      error: error.message,
    })
  }


}


//This code taken from this site. Some is out of date esepcially callbacks. See this method for changes (had to change to try catch block)
//https://www.loginradius.com/blog/engineering/guest-post/nodejs-authentication-guide/
//update the role of the user
exports.update = async (req, res, next) => {
  const { role, id } = req.body;
  console.log("role = " + role);
  // First - Verifying if role and id is presnt
  if (role && id) {
    // Second - Verifying if the value of role is admin
    if (role === "admin") {
      // Finds the user with the id
      User.findById(id)
        .then((user) => {
          // Third - Verifies the user is not an admin
          if (user.role !== "admin") {
            user.role = role;

            //This was the code as posted on the site. It throws errors. See below for chanage
            /*                user.save((err) => {
                            //Monogodb error checker
                            if (err) {
                              res
                                .status("400")
                                .json({ message: "An error occurred", error: err.message });
                              process.exit(1);
                            }
                            res.status("201").json({ message: "Update successful", user });
                          });
             */
            //Had to change code to try/catch block to get it to work 
            try {
              user.save().then(user =>
                res.status(201).json({ message: "Update successful", user, })
              )
            } catch (err) {
              res.status(401).json({
                message: "An error occurred",
                error: err.message,
              })
            }

          } else {
            res.status(400).json({ message: "User is already an Admin" });
          }
        })
        .catch((error) => {
          res
            .status(400)
            .json({ message: "An error occurred", error: error.message });
        });
    } else {
      console.log("Only can cassign admin role here. Error")
      res
        .status(400)
        .json({ message: "A logic error occured", error: "Cant assign that role with this endpoint" });
    }
  }


}

exports.deleteUser = async (req, res, next) => {
  const { id } = req.body
  await User.findById(id)
    .then(user => user.deleteOne())
    .then(user =>
      res.status(201).json({ message: "User successfully deleted", user })
    )
    .catch(error =>
      res
        .status(400)
        .json({ message: "An error occurred", error: error.message })
    )
}