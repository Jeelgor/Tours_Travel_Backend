const TourPackageDetail = require("../models/TourDetail");

async function getTourData() {
  try {
    const res = await TourPackageDetail.find();
    return res;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

module.exports = { getTourData };
