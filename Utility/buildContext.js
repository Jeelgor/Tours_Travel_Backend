const buildContextString = (groupedTours) => {
  return groupedTours
    .map((tour) => {
      return `
Tour: ${tour.tourName}
${tour.sections.join("\n")}
`;
    })
    .join("\n-------------------\n");
};

module.exports = { buildContextString };
