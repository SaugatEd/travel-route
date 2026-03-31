// Image and map data for Europe 2026 trip itinerary
// Hero images use Unsplash source (reliable, always loads)
// Maps use OpenStreetMap embeds

export const CITY_IMAGES = {
  fco: {
    hero: "https://images.unsplash.com/photo-1529260830199-42c24126f198?w=1280&q=80",
    gallery: [],
    mapEmbed: "https://www.openstreetmap.org/export/embed.html?bbox=12.20,41.78,12.30,41.82&layer=mapnik&marker=41.8003,12.2389",
  },
  rome: {
    hero: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1280&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1555992828-ca4dbe41d294?w=640&q=80",
      "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=640&q=80",
      "https://images.unsplash.com/photo-1525874684015-58379d421a52?w=640&q=80",
    ],
    mapEmbed: "https://www.openstreetmap.org/export/embed.html?bbox=12.43,41.87,12.56,41.93&layer=mapnik&marker=41.9028,12.4964",
  },
  como: {
    hero: "https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?w=1280&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1582653291997-079a1c04e5a1?w=640&q=80",
      "https://images.unsplash.com/photo-1536599018102-9f803c979981?w=640&q=80",
    ],
    mapEmbed: "https://www.openstreetmap.org/export/embed.html?bbox=8.98,45.75,9.19,45.86&layer=mapnik&marker=45.8080,9.0852",
  },
  lucerne: {
    hero: "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?w=1280&q=80",
    gallery: [],
    mapEmbed: "https://www.openstreetmap.org/export/embed.html?bbox=8.25,47.02,8.37,47.08&layer=mapnik&marker=47.0502,8.3093",
  },
  lauterbrunnen: {
    hero: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1280&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1594749462749-3dfb3da2f09d?w=640&q=80",
    ],
    mapEmbed: "https://www.openstreetmap.org/export/embed.html?bbox=7.85,46.56,7.97,46.62&layer=mapnik&marker=46.5935,7.9089",
  },
  interlaken: {
    hero: "https://images.unsplash.com/photo-1570993492881-25240ce854f4?w=1280&q=80",
    gallery: [],
    mapEmbed: "https://www.openstreetmap.org/export/embed.html?bbox=7.80,46.65,7.93,46.72&layer=mapnik&marker=46.6863,7.8632",
  },
  zurich: {
    hero: "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=1280&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1554913240-26fe6e0ac59c?w=640&q=80",
    ],
    mapEmbed: "https://www.openstreetmap.org/export/embed.html?bbox=8.48,47.34,8.60,47.41&layer=mapnik&marker=47.3769,8.5417",
  },
  innsbruck: {
    hero: "https://images.unsplash.com/photo-1567604561839-9e9f95237ede?w=1280&q=80",
    gallery: [],
    mapEmbed: "https://www.openstreetmap.org/export/embed.html?bbox=11.34,47.23,11.47,47.30&layer=mapnik&marker=47.2692,11.4041",
  },
  salzburg: {
    hero: "https://images.unsplash.com/photo-1595867818082-083862f3d630?w=1280&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1608436282024-7efff36fb7de?w=640&q=80",
    ],
    mapEmbed: "https://www.openstreetmap.org/export/embed.html?bbox=12.99,47.77,13.12,47.84&layer=mapnik&marker=47.8095,13.0550",
  },
  vienna: {
    hero: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=1280&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1573599852326-2d4da0bbe613?w=640&q=80",
      "https://images.unsplash.com/photo-1609856878074-cf31e21ccb6b?w=640&q=80",
    ],
    mapEmbed: "https://www.openstreetmap.org/export/embed.html?bbox=16.30,48.17,16.44,48.24&layer=mapnik&marker=48.2082,16.3738",
  },
  prague: {
    hero: "https://images.unsplash.com/photo-1541849546-216549ae216d?w=1280&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1562624475-96c2bc08fab9?w=640&q=80",
    ],
    mapEmbed: "https://www.openstreetmap.org/export/embed.html?bbox=14.37,50.04,14.50,50.11&layer=mapnik&marker=50.0755,14.4378",
  },
  berlin: {
    hero: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=1280&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1587330979470-3595ac045ab0?w=640&q=80",
      "https://images.unsplash.com/photo-1599946347371-68eb71b16afc?w=640&q=80",
    ],
    mapEmbed: "https://www.openstreetmap.org/export/embed.html?bbox=13.34,52.48,13.47,52.55&layer=mapnik&marker=52.5200,13.4050",
  },
  amsterdam: {
    hero: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1280&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?w=640&q=80",
    ],
    mapEmbed: "https://www.openstreetmap.org/export/embed.html?bbox=4.84,52.33,4.97,52.40&layer=mapnik&marker=52.3676,4.9041",
  },
};

export const ROUTE_MAPS = {
  fullRoute: "https://www.openstreetmap.org/export/embed.html?bbox=4.50,41.50,17.00,53.00&layer=mapnik",
  segments: [
    { from: "rome", to: "como", mapUrl: "https://www.openstreetmap.org/export/embed.html?bbox=9.00,41.85,12.55,45.90&layer=mapnik" },
    { from: "como", to: "lucerne", mapUrl: "https://www.openstreetmap.org/export/embed.html?bbox=8.25,45.75,9.20,47.10&layer=mapnik" },
    { from: "lucerne", to: "lauterbrunnen", mapUrl: "https://www.openstreetmap.org/export/embed.html?bbox=7.85,46.55,8.40,47.10&layer=mapnik" },
    { from: "interlaken", to: "zurich", mapUrl: "https://www.openstreetmap.org/export/embed.html?bbox=7.80,46.65,8.60,47.42&layer=mapnik" },
    { from: "zurich", to: "innsbruck", mapUrl: "https://www.openstreetmap.org/export/embed.html?bbox=8.48,47.22,11.48,47.42&layer=mapnik" },
    { from: "innsbruck", to: "salzburg", mapUrl: "https://www.openstreetmap.org/export/embed.html?bbox=11.34,47.22,13.15,47.85&layer=mapnik" },
    { from: "salzburg", to: "vienna", mapUrl: "https://www.openstreetmap.org/export/embed.html?bbox=12.99,47.77,16.45,48.25&layer=mapnik" },
    { from: "vienna", to: "prague", mapUrl: "https://www.openstreetmap.org/export/embed.html?bbox=14.37,48.17,16.45,50.12&layer=mapnik" },
    { from: "prague", to: "berlin", mapUrl: "https://www.openstreetmap.org/export/embed.html?bbox=13.34,50.04,14.50,52.56&layer=mapnik" },
    { from: "berlin", to: "amsterdam", mapUrl: "https://www.openstreetmap.org/export/embed.html?bbox=4.84,52.33,13.47,52.56&layer=mapnik" },
  ],
};

export const LANDMARK_IMAGES = {
  colosseum: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=640&q=80",
  vatican: "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=640&q=80",
  trevi: "https://images.unsplash.com/photo-1525874684015-58379d421a52?w=640&q=80",
  como_lake: "https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?w=640&q=80",
  chapel_bridge: "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?w=640&q=80",
  lauterbrunnen_valley: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=640&q=80",
  eiger: "https://images.unsplash.com/photo-1570993492881-25240ce854f4?w=640&q=80",
  zurich_lake: "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=640&q=80",
  nordkette: "https://images.unsplash.com/photo-1567604561839-9e9f95237ede?w=640&q=80",
  hohensalzburg: "https://images.unsplash.com/photo-1595867818082-083862f3d630?w=640&q=80",
  schoenbrunn: "https://images.unsplash.com/photo-1573599852326-2d4da0bbe613?w=640&q=80",
  klimt_kiss: "https://images.unsplash.com/photo-1609856878074-cf31e21ccb6b?w=640&q=80",
  charles_bridge: "https://images.unsplash.com/photo-1541849546-216549ae216d?w=640&q=80",
  brandenburg_gate: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=640&q=80",
  east_side_gallery: "https://images.unsplash.com/photo-1587330979470-3595ac045ab0?w=640&q=80",
  amsterdam_canals: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=640&q=80",
};
