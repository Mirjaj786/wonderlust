if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const path = require("path");
const mongoose = require("mongoose");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingsRoute = require("./routes/listings.js");
const reviewsRoute = require("./routes/review.js");
const userRoute = require("./routes/user.js");
const searchRoute = require("./routes/search.js");
const Listing = require("./models/listing.js");
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static("assest"));
app.engine("ejs", ejsMate);

// const { execPath } = require("process");
// let MONGO_URL = "mongodb://127.0.0.1:27017/wonderlust";
const DB_URL = process.env.ATLAST_URL;

main()
  .then(() => {
    console.log("connection successfull to DB ");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(DB_URL);
}

const store = MongoStore.create({
  mongoUrl: DB_URL,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("Error In Mongo Session Store ", err);
});

const sessionoption = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};


app.use(session(sessionoption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

app.use("/listings", listingsRoute);
app.use("/listings/:id/reviews", reviewsRoute);
app.use("/", userRoute);
app.use("/search", searchRoute);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 505, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

const port = 8080;
app.listen(port, () => {
  console.log("Server was listning on port 8080");
  console.log(ExpressError);
  console.log(`http://localhost:${port}/login`);
});
