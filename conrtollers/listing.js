const { query } = require("express");
const Listing = require("../models/listing.js");
const axios = require("axios");
require('dotenv').config();


// OpenCage Geocoding API - Free tier with 2500 requests/day
const OPENCAGE_API_KEY = process.env.OPENCAGE_API_KEY || 'b60b2a9ada2b448aa5ea841e86022f22';

async function geocodeLocation(location) {
  try {
    const encodedLocation = encodeURIComponent(location);
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodedLocation}&key=${OPENCAGE_API_KEY}&limit=1`;

    const response = await axios.get(url);
    const data = response.data;

    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      const { lat, lng } = result.geometry;

      console.log(`The latitude is ${lat} and the longitude id ${lng}`);

      // Return coordinates in GeoJSON format [longitude, latitude]
      return [lng, lat];
    }

    throw new Error('No results found for this location');
  } catch (error) {
    console.error('Geocoding error:', error.message);
    throw error;
  }
}

module.exports.index = async (req, res) => {
  const allListing = await Listing.find();
  res.render("./listings/index.ejs", { allListing });
};

module.exports.newRouteform = (req, res) => {
  res.render("./listings/new.ejs");
};

module.exports.showListings = async (req, res) => {
  let { id } = req.params;
  const listingData = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listingData) {
    req.flash("error", "Listing You Requested for dose not exist!");
    res.redirect("/listings");
  }
  res.render("./listings/show.ejs", { listingData });
};

module.exports.createNewListings = async (req, res, next) => {
  try {
    // Get the location from the form
    const location = req.body.listing.location;

    // Create the new listing
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    // Always set a default geometry as Kolkata (e.g., [22.5744, 88.3629])
    newListing.geometry = {
      type: "Point",
      coordinates: [88.3629, 22.5744]
    };

    // Try to geocode the location if OpenCage API key is available
    if (OPENCAGE_API_KEY) {
      try {
        const coordinates = await geocodeLocation(location);
        // Update geometry with real coordinates
        newListing.geometry.coordinates = coordinates;
        console.log('Geocoding successful for:', location, 'Coordinates:', coordinates);
      } catch (geocodingError) {
        console.error('Geocoding failed:', geocodingError.message);
        // Keep default coordinates
      }
    } else {
      console.warn('OpenCage API key not configured - skipping geocoding');
      // Keep default coordinates
    }

    // Handle file upload if an image was uploaded
    if (req.file) {
      const url = req.file.path;
      const filename = req.file.filename;
      newListing.image = { url, filename };
    }

    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
  } catch (error) {
    console.error("Error creating listing:", error);
    req.flash("error", "Error creating listing. Please try again.");
    res.redirect("/listings/new");
  }
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listingData = await Listing.findById(id);

  if (!listingData) {
    req.flash("error", "Listing You Requested for dose not exist!");
    res.redirect("/listings");
  }
  let originalimageUrl = listingData.image.url;
  originalimageUrl.replace("/upload", "/upload/w_250,e_blur_300");
  res.render("listings/edit.ejs", { listingData, originalimageUrl });
};

// Update Listing
module.exports.updateListings = async (req, res) => {
  try {
    const { id } = req.params;
    const listingData = req.body.listing;

    // Get the location from the form
    const location = listingData.location;

    // Try to geocode the location if OpenCage API key is available
    if (OPENCAGE_API_KEY && OPENCAGE_API_KEY !== 'b60b2a9ada2b448aa5ea841e86022f22') {
      try {
        const coordinates = await geocodeLocation(location);

        // Add geometry to the listing data
        listingData.geometry = {
          type: "Point",
          coordinates: coordinates
        };

        console.log('Geocoding successful for:', location, 'Coordinates:', coordinates);
      } catch (geocodingError) {
        console.error('Geocoding failed:', geocodingError.message);
        // Continue without updating coordinates
      }
    } else {
      console.warn('OpenCage API key not configured - skipping geocoding');
    }

    // Update the listing with form data
    let updatedListing = await Listing.findByIdAndUpdate(id, listingData, {
      runValidators: true,
      new: true,
    });

    // Handle file upload if a new image was uploaded
    if (req.file) {
      const url = req.file.path;
      const filename = req.file.filename;
      updatedListing.image = { url, filename };
      await updatedListing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
  } catch (error) {
    console.error("Error updating listing:", error);
    req.flash("error", "Error updating listing. Please try again.");
    res.redirect(`/listings/${req.params.id}/edit`);
  }
};

module.exports.deleteListings = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", " Listing Deleted!");
  res.redirect("/listings");
};
