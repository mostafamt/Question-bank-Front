/**
 * @file hitTest.js
 * @description Find which area is under a point on the page. Used by the
 * right-click menu: in edit mode the boxes belong to the third-party
 * AreaSelector and carry no id we can read, so blocks are found by position.
 */

const isPercentUnit = (unit) => unit === "%" || unit === "percentage";

const toPx = (value, unit, size) =>
  isPercentUnit(unit) ? (value / 100) * size : value;

/**
 * @param {Object[]} areas - Areas of one page ({ x, y, width, height, unit })
 * @param {{ x: number, y: number }} point - Point relative to the page image's top-left, in px
 * @param {{ width: number, height: number }} size - Rendered page image size, in px (for % areas)
 * @param {(idx: number) => boolean} [isCandidate] - Return false to skip an area
 * @returns {number} Index of the smallest area containing the point, or -1
 */
export function findAreaIndexAtPoint(
  areas,
  point,
  size,
  isCandidate = () => true
) {
  let bestIdx = -1;
  let bestSize = Infinity;

  (areas || []).forEach((area, idx) => {
    if (!area || !isCandidate(idx)) return;

    const unit = area.unit || "px";
    const left = toPx(area.x, unit, size.width);
    const top = toPx(area.y, unit, size.height);
    const width = toPx(area.width, unit, size.width);
    const height = toPx(area.height, unit, size.height);

    const inside =
      point.x >= left &&
      point.x <= left + width &&
      point.y >= top &&
      point.y <= top + height;
    if (!inside) return;

    // Smallest wins, so a small block inside a big one is still reachable.
    const areaSize = width * height;
    if (areaSize < bestSize) {
      bestSize = areaSize;
      bestIdx = idx;
    }
  });

  return bestIdx;
}

export default findAreaIndexAtPoint;
