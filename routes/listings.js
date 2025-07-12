const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const Listing = require("../models/listing");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingControler = require("../conrtollers/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// API endpoint for getting all listings (for map)
router.get("/api/listings", wrapAsync(async (req, res) => {
  const allListings = await Listing.find();
  res.json(allListings);
}));

router
  .route("/")
  // Index Route
  .get(wrapAsync(listingControler.index))
  //create Route
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingControler.createNewListings)
  );

//new Route
router.get("/new", isLoggedIn, listingControler.newRouteform);

router
  .route("/:id")
  // Show Route
  .get(wrapAsync(listingControler.showListings))
  //Update Route
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingControler.updateListings)
  )
  //delete route
  .delete(isLoggedIn, isOwner, wrapAsync(listingControler.deleteListings));

// Edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingControler.renderEditForm)
);

module.exports = router;
