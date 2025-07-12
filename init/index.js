const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wonderlust";

main()
  .then(() => console.log("Connection successful to DB"))
  .catch((err) => console.error("Connection error:", err));


async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  try {
    await Listing.deleteMany({});
    const ownerId = new mongoose.Types.ObjectId("686628fa70962a1a09be7a4d");
    initData.data = initData.data.map((obj) => ({
      ...obj,
      owner: ownerId,
    }));

    await Listing.insertMany(initData.data);
    console.log("Data was initialized");
  } catch (err) {
    console.error("Error initializing data:", err);
  }
};

initDB();
