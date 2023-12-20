const express = require("express")
const router = express.Router()
const { register, testHeaderResponse, login, update, deleteUser } = require("./Auth")
router.route("/register").post(register)
//router.route("/testHeaderResponse").get(testHeaderResponse)
router.route("/login").post(login);
router.route("/update").put(update);
router.route("/deleteUser").delete(deleteUser);
module.exports = router