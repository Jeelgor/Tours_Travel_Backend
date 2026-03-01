const groupChunksByTour = (chunks) => {
  const map = new Map();

  for (const chunk of chunks) {
    const id = chunk.tour_id;

    if (!map.has(id)) {
      map.set(id, {
        tourName: chunk.tour_name,
        sections: [],
      });
    }

    map.get(id).sections.push(chunk.content);
  }

  return Array.from(map.values());
};

module.exports = { groupChunksByTour };
