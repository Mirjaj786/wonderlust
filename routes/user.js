const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../conrtollers/users.js");

router
  .route("/signup")
  // Get Request For Signup
  .get(userController.renderSignupform)
  // POST Request For Signup
  .post(wrapAsync(userController.signupNewUser));

router
  .route("/login")
  //Get Request For Login
  .get(userController.renderLoginForm)

  //POST Request for login
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.newUserLogin
  );

router.get("/logout", userController.logoutUser);
module.exports = router;
