/**
 * @file hitTest.test.js
 * @description Tests for findAreaIndexAtPoint (right-click menu block lookup).
 */

import { findAreaIndexAtPoint } from "../hitTest";

const size = { width: 1000, height: 2000 };

describe("findAreaIndexAtPoint", () => {
  it("finds a px area containing the point", () => {
    const areas = [{ x: 100, y: 100, width: 200, height: 50, unit: "px" }];
    expect(findAreaIndexAtPoint(areas, { x: 150, y: 120 }, size)).toBe(0);
  });

  it("treats a missing unit as px", () => {
    const areas = [{ x: 100, y: 100, width: 200, height: 50 }];
    expect(findAreaIndexAtPoint(areas, { x: 150, y: 120 }, size)).toBe(0);
  });

  it("converts % and 'percentage' areas using the image size", () => {
    const areas = [
      { x: 10, y: 10, width: 10, height: 5, unit: "%" },
      { x: 50, y: 50, width: 10, height: 5, unit: "percentage" },
    ];
    // 10% of 1000 = 100, 10% of 2000 = 200
    expect(findAreaIndexAtPoint(areas, { x: 150, y: 250 }, size)).toBe(0);
    expect(findAreaIndexAtPoint(areas, { x: 550, y: 1050 }, size)).toBe(1);
  });

  it("returns -1 when the point is outside every area", () => {
    const areas = [{ x: 100, y: 100, width: 200, height: 50, unit: "px" }];
    expect(findAreaIndexAtPoint(areas, { x: 10, y: 10 }, size)).toBe(-1);
    expect(findAreaIndexAtPoint([], { x: 10, y: 10 }, size)).toBe(-1);
    expect(findAreaIndexAtPoint(undefined, { x: 10, y: 10 }, size)).toBe(-1);
  });

  it("picks the smallest area when areas overlap", () => {
    const areas = [
      { x: 0, y: 0, width: 500, height: 500, unit: "px" },
      { x: 100, y: 100, width: 50, height: 50, unit: "px" },
    ];
    expect(findAreaIndexAtPoint(areas, { x: 120, y: 120 }, size)).toBe(1);
    expect(findAreaIndexAtPoint(areas, { x: 300, y: 300 }, size)).toBe(0);
  });

  it("skips areas rejected by isCandidate", () => {
    const areas = [
      { x: 0, y: 0, width: 500, height: 500, unit: "px" },
      { x: 100, y: 100, width: 50, height: 50, unit: "px" },
    ];
    const notSecond = (idx) => idx !== 1;
    expect(findAreaIndexAtPoint(areas, { x: 120, y: 120 }, size, notSecond)).toBe(0);
  });
});
