/**
 * Built-in background music tracks for the reader.
 * See docs/2026-10-10/READER_MUSIC_PLAN.md, section 3.
 *
 * Every entry must have a `credit`, and only add tracks we hold a licence
 * for. Files live in `public/music/`.
 *
 * @type {{ id: string, label: string, url: string,
 *          credit: { artist: string, license: string, source: string } }[]}
 */

export const READER_MUSIC_TRACKS = [];
