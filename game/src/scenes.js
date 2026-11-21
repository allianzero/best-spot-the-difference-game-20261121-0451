// Scene data for Twin Lanterns: three original hand-drawn scenes, each with
// seven hidden differences. Coordinates live in scene space (600 x 520),
// the size of one panel; the painters in draw.js draw the same scene twice,
// once plain (left panel) and once with every difference applied (right).
// `r` is the click radius around the difference; `label` is the name shown
// in the "found" toast so the player learns what they spotted.

export const SCENE_WIDTH = 600;
export const SCENE_HEIGHT = 520;

export const SCENES = [
  {
    id: 'garden',
    name: 'Lantern Garden',
    tagline: 'A sunny cottage garden. Warm up your eyes — 7 differences hide here.',
    difficulty: 'Easy',
    timeLimit: 120,
    painter: 'paintGarden',
    differences: [
      { id: 'sun-rays', x: 90, y: 70, r: 48, label: 'Sun rays' },
      { id: 'chimney-smoke', x: 318, y: 182, r: 30, label: 'Chimney smoke' },
      { id: 'flower-box', x: 192, y: 356, r: 26, label: 'Window flower box' },
      { id: 'tree-apple', x: 445, y: 278, r: 18, label: 'Apple on the tree' },
      { id: 'butterfly', x: 352, y: 182, r: 26, label: 'Butterfly' },
      { id: 'fence-picket', x: 145, y: 428, r: 18, label: 'Fence picket' },
      { id: 'tulip', x: 520, y: 470, r: 20, label: 'Tulip colour' },
    ],
  },
  {
    id: 'harbour',
    name: 'Harbour Dusk',
    tagline: 'A sleepy harbour at dusk. The lighthouse keeper swears nothing moved.',
    difficulty: 'Medium',
    timeLimit: 100,
    painter: 'paintHarbour',
    differences: [
      { id: 'moon', x: 480, y: 70, r: 34, label: 'The moon' },
      { id: 'lighthouse-beam', x: 200, y: 120, r: 42, label: 'Lighthouse beam' },
      { id: 'gull', x: 300, y: 92, r: 22, label: 'A seagull' },
      { id: 'boat-flag', x: 270, y: 290, r: 20, label: 'Boat flag' },
      { id: 'buoy', x: 520, y: 430, r: 22, label: 'Buoy' },
      { id: 'top-crate', x: 240, y: 338, r: 20, label: 'Top crate' },
      { id: 'lighthouse-window', x: 85, y: 202, r: 18, label: 'Lighthouse window' },
    ],
  },
  {
    id: 'market',
    name: 'Night Market',
    tagline: 'Lanterns, stalls and one very sneaky cat. The hardest hunt of the three.',
    difficulty: 'Hard',
    timeLimit: 90,
    painter: 'paintMarket',
    differences: [
      { id: 'lantern-colour', x: 300, y: 232, r: 24, label: 'Lantern colour' },
      { id: 'market-cat', x: 480, y: 382, r: 30, label: 'The market cat' },
      { id: 'banner-tassel', x: 333, y: 170, r: 18, label: 'Banner tassel' },
      { id: 'basket-apple', x: 160, y: 292, r: 18, label: 'Apple on the counter' },
      { id: 'string-bulb', x: 200, y: 76, r: 16, label: 'A string-light bulb' },
      { id: 'missing-star', x: 420, y: 52, r: 16, label: 'A star' },
      { id: 'awning-stripe', x: 440, y: 160, r: 22, label: 'Awning stripe' },
    ],
  },
];

// A tiny deterministic pseudo-random source so decorative twinkles and
// drifting clouds look the same on every run (screenshots stay stable).
export function seededRandom(seed) {
  let s = seed >>> 0;
  return function next() {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
