const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const Listing = require("../models/listing");

// Search route for location-based search
router.post("/", wrapAsync(async (req, res) => {
    const { searchQuery } = req.body;

    if (!searchQuery || searchQuery.trim() === "") {
        req.flash("error", "Please enter a search term");
        return res.redirect("/listings");
    }

    // Create a case-insensitive regex pattern for searching
    const searchRegex = new RegExp(searchQuery.trim(), "i");

    // Search in location, country, and title fields
    const searchResults = await Listing.find({
        $or: [
            { location: searchRegex },
            { country: searchRegex },
            { title: searchRegex }
        ]
    }).populate("owner");

    if (searchResults.length === 0) {
        req.flash("error", `No listings found for "${searchQuery}"`);
        return res.redirect("/listings");
    }

    // Store search results in session and redirect to search page
    req.session.searchResults = searchResults;
    req.session.searchQuery = searchQuery;
    req.flash("success", `Found ${searchResults.length} listing(s) for "${searchQuery}"`);
    res.redirect("/search/results");
}));

// GET route to display search results
router.get("/results", wrapAsync(async (req, res) => {
    const searchResults = req.session.searchResults;
    const searchQuery = req.session.searchQuery;
    
    if (!searchResults) {
        req.flash("error", "No search results found");
        return res.redirect("/listings");
    }
    
    // Clear session data after retrieving it
    delete req.session.searchResults;
    delete req.session.searchQuery;
    
    res.render("listings/search", { 
        listings: searchResults,
        searchQuery: searchQuery 
    });
}));

module.exports = router; 