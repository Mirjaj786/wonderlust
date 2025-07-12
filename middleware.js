const Listing = require("./models/listing");
const { listingSchema, reviewSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");
const Review = require("./models/review.js");


module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    //Info OriginalUrl save
    req.session.redirectUrl = req.originalUrl;
    console.log(" this is Url ", req.session.redirectUrl);
    req.flash("error", "You must be login for create new listing");
    res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let newlisting = await Listing.findById(id);
  if (!newlisting) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  if (!newlisting.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner of the listing");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.isreviewAuthor = async (req,res,next) => {
  let { reviewId, id} = req.params;
  let review = await Review.findById(reviewId);
  console.log(req.params.reviewId);
  if (!review) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the Author of the Review");
    return res.redirect(`/listings/${id}`);
  }
  next();
}

module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};
