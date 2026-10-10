/**
 * Built-in background music tracks for the reader.
 * See docs/2026-10-10/READER_MUSIC_PLAN.md, section 3.
 *
 * Every entry must have a `credit`. The artist describes these tracks as
 * CC0, but the album's licence label says CC BY 4.0, so we credit them as
 * CC BY 4.0 to satisfy both. Files live in `public/music/`.
 *
 * @type {{ id: string, label: string, url: string,
 *          credit: { artist: string, license: string, source: string } }[]}
 */

const HOLIZNA_CREDIT = {
  artist: "HoliznaCC0",
  license: "CC BY 4.0",
  source: "https://holiznacc0.bandcamp.com/album/public-domain-lo-fi",
};

export const READER_MUSIC_TRACKS = [
  {
    id: "calm-current",
    label: "Chill Lofi",
    url: "/music/Chill Lofi.mp3",
    credit: HOLIZNA_CREDIT,
  },
  // {
  //   id: "ease-into-night",
  //   label: "Ease Into Night",
  //   url: "/music/ease-into-night.mp3",
  //   credit: HOLIZNA_CREDIT,
  // },
  // {
  //   id: "wetlands",
  //   label: "Wetlands",
  //   url: "/music/wetlands.mp3",
  //   credit: HOLIZNA_CREDIT,
  // },
];
