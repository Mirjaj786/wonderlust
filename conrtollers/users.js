const User = require("../models/user.js");

module.exports.renderSignupform = (req, res) => {
  res.render("Users/signup.ejs");
};

module.exports.signupNewUser = async (req, res, next) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({
      email,
      username,
    });
    let registorUser = await User.register(newUser, password);
    console.log(registorUser);
    req.login(registorUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to Wonderlust!");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("Users/login.ejs");
};

module.exports.newUserLogin = async (req, res) => {
  req.flash("success", "Welcome back to Wonderlust!");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

module.exports.logoutUser = (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "User logged out!");
    res.redirect("/listings");
  });
};
