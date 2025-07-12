// Wait for DOM to be fully loaded

document.addEventListener('DOMContentLoaded', function() {
  // Check if map container exists
  const mapContainer = document.getElementById("map");
  if (!mapContainer) {
    console.error("Map container not found");
    return;
  }

  try {
    // Get coordinates from data attributes
    const lat = parseFloat(mapContainer.dataset.lat);
    const lng = parseFloat(mapContainer.dataset.lng);
    const location = mapContainer.dataset.location;

    // Check if coordinates are available
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      console.warn("No valid coordinates found, using default location (Kolkata)");
      // Fallback to default location
      const map = L.map("map").setView([22.7248, 88.4789], 12);
      
      // Try to use MapTiler, fallback to OpenStreetMap if not available
      try {
        L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=Ptm9WGrbtsGZPK7nVAFl', {
          attribution: '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 20,
        }).addTo(map);
      } catch (tileError) {
        console.warn('MapTiler not available, using OpenStreetMap');
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);
      }

      L.marker([22.7248, 88.4789]).addTo(map).bindPopup("Default Location: Kolkata").openPopup();
      map.zoomControl.setPosition('topright');
      return;
    }

    // Initialize the map with the listing's coordinates
    const map = L.map("map").setView([lat, lng], 13);

    // Try to use MapTiler, fallback to OpenStreetMap if not available
    try {
      L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=Ptm9WGrbtsGZPK7nVAFl', {
        attribution: '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 20,
      }).addTo(map);
    } catch (tileError) {
      console.warn('MapTiler not available, using OpenStreetMap');
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);
    }

    // Add a marker with the listing's coordinates
    L.marker([lat, lng]).addTo(map).bindPopup(location || "Listing Location").openPopup();

    // Optional: Add map controls
    map.zoomControl.setPosition('topright');
    
    console.log("Map initialized successfully with coordinates:", lat, lng);
  } catch (error) {
    console.error("Error initializing map:", error);
    // Show a fallback message
    mapContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">Map could not be loaded. Please try refreshing the page.</div>';
  }
});

// Map rendering logic for listing detail page
// Expects global variable 'listingCoordinates' as [lng, lat]

if (typeof listingCoordinates !== 'undefined' && Array.isArray(listingCoordinates)) {
  // Leaflet expects [lat, lng]
  const latlng = [listingCoordinates[1], listingCoordinates[0]];

  var map = L.map('map').setView(latlng, 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data © OpenStreetMap contributors'
  }).addTo(map);

  L.marker(latlng).addTo(map)
    .bindPopup("Listing Location")
    .openPopup();
} else {
  console.warn("listingCoordinates not defined or invalid");
}
