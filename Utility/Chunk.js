const createTourChunks = (tour) => {
  const chunks = [];

  const tourName = tour?.aboutProperty?.title || "Tour";

  // 1️⃣ Overview
  if (tour.overview?.length) {
    chunks.push({
      text: `${tourName} is a ${tour.packageType} package. ${tour.overview[1]} It has a rating of ${tour.overview[2]}.`,
      metadata: { tourId: tour._id, chunkType: "overview", tourName },
    });
  }

  // 2️⃣ Description
  if (tour?.aboutProperty?.description) {
    chunks.push({
      text: `${tourName} description: ${tour.aboutProperty.description}`,
      metadata: { tourId: tour._id, chunkType: "description", tourName },
    });
  }

  // 3️⃣ Amenities + perks
  const amenitiesText = [
    ...(tour.amenities || []),
    ...(tour?.aboutProperty?.perks || []),
  ];

  if (amenitiesText.length) {
    chunks.push({
      text: `${tourName} offers amenities such as ${amenitiesText.join(", ")}.`,
      metadata: { tourId: tour._id, chunkType: "amenities", tourName },
    });
  }

  // 4️⃣ Accessibility
  if (tour.accessibility) {
    chunks.push({
      text: `${tourName} accessibility info: ${tour.accessibility}`,
      metadata: { tourId: tour._id, chunkType: "accessibility", tourName },
    });
  }

  // 5️⃣ Common areas
  if (tour.commonAreas?.length) {
    chunks.push({
      text: `${tourName} includes common areas like ${tour.commonAreas.join(", ")}.`,
      metadata: { tourId: tour._id, chunkType: "facilities", tourName },
    });
  }

  return chunks;
};

module.exports = { createTourChunks };
