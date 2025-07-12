const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync");
const Review = require("../models/review.js");
const Listing = require("../models/listing");
const {validateReview, isLoggedIn, isreviewAuthor} = require("../middleware.js");
const reviewController = require("../conrtollers/reviews.js")



//post request for review
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.createNewReview)
);

// Detele Route for review delete
router.delete(
  "/:reviewId",
  isLoggedIn,
  isreviewAuthor,
  wrapAsync(reviewController.deleteReview)
);

module.exports = router;
