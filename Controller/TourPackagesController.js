const TourPackages = require("../models/TourPackages");

exports.Tourpackages = async (req, res) => {
  // this code for insert multiple packages at the same time
  const TourPackagesArray = req.body;

  try {
    const packageData = await TourPackages.insertMany(TourPackagesArray);
    console.log(packageData);
    res.status(200).json({ msg: "Package Addedd SuccessFully!" });
  } catch (error) {
    res.status(500).json({ msg: "Failed to Add Packages please try  Again" });
    console.log(error);
  }

  // this code for insert single packages at the same time

  //     const {TourName,TourPrice,keyPoints1,keyPoints2,keyPoints3,keyPoints4,keyPoints5} = req.body;

  //   try {
  //     const newTourPackages = new TourPackages({
  //         TourName,
  //         TourPrice,
  //         keyPoints1,
  //         keyPoints2,
  //         keyPoints3,
  //         keyPoints4,
  //         keyPoints5,
  //     });
  //   const packageData = await newTourPackages.save();
  //   console.log(packageData);
  //   res.status(200).json({msg:"Package Addedd SuccessFully!"});
  //   } catch (error) {
  //      res.status(500).json({msg:"Failed to Add Packages please try  Again"});
  //      console.log(error);
  //   }
};
