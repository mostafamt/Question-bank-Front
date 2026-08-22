/**
 * Tests for the isDeep block flag
 */

import { isDeepBlock } from "../areaUtils";
import { updateAreasProperties } from "../../../../utils/ocr";

describe("isDeepBlock", () => {
  it("reads true only for a literal true", () => {
    expect(isDeepBlock({ isDeep: true })).toBe(true);
  });

  it.each([
    ["false", { isDeep: false }],
    ["undefined", { isDeep: undefined }],
    ["null", { isDeep: null }],
    ["missing key", {}],
    ["truthy string", { isDeep: "true" }],
    ["undefined area", undefined],
    ["null area", null],
  ])("reads false for %s", (_label, area) => {
    expect(isDeepBlock(area)).toBe(false);
  });
});

describe("updateAreasProperties isDeep preservation", () => {
  const makeArea = () => ({ x: 1, y: 2, width: 3, height: 4 });

  const makeProperty = (overrides = {}) => ({
    ...makeArea(),
    id: "block-1",
    color: "#fff",
    loading: false,
    text: "",
    image: "",
    type: "",
    label: "",
    typeOfLabel: "",
    parameter: "",
    order: 0,
    open: false,
    isServer: false,
    ...overrides,
  });

  // Regression guard: updateAreasProperties rebuilds each property from an
  // explicit whitelist rather than spreading, so a field missing from that list
  // is wiped on every sync (which fires whenever a new area is drawn).
  it("preserves isDeep on an existing block across a sync", () => {
    const result = updateAreasProperties(
      [[makeProperty({ isDeep: true })]],
      0,
      [[makeArea()]],
      false,
      ""
    );

    expect(result[0][0].isDeep).toBe(true);
  });

  it("normalizes a missing isDeep to false rather than undefined", () => {
    const result = updateAreasProperties(
      [[makeProperty()]],
      0,
      [[makeArea()]],
      false,
      ""
    );

    expect(result[0][0].isDeep).toBe(false);
  });

  it("defaults a newly drawn area to isDeep false", () => {
    const result = updateAreasProperties(
      [[makeProperty({ isDeep: true })]],
      0,
      [[makeArea(), makeArea()]],
      false,
      ""
    );

    expect(result[0][0].isDeep).toBe(true);
    expect(result[0][1].isDeep).toBe(false);
  });

  // A page the server flags isNewPage has no scanned content, so blocks drawn
  // on it default to deep (author-entered) rather than OCR/crop-derived.
  it("defaults a newly drawn area to isDeep true on an isNewPage page", () => {
    const result = updateAreasProperties(
      [[makeProperty({ isDeep: false })]],
      0,
      [[makeArea(), makeArea()]],
      false,
      "",
      true
    );

    expect(result[0][0].isDeep).toBe(false);
    expect(result[0][1].isDeep).toBe(true);
  });
});
