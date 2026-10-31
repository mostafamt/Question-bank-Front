import { findTypeByName, isSameTypeName } from "./typeName";

const MEDIA = ["Video", "PDF", "PowerPoint"];

describe("isSameTypeName", () => {
  it.each(MEDIA)("matches both spellings of %s in either order", (media) => {
    const smartFirst = `Smart Interactive ${media}`;
    const interactiveFirst = `Interactive Smart ${media}`;

    expect(isSameTypeName(smartFirst, interactiveFirst)).toBe(true);
    expect(isSameTypeName(interactiveFirst, smartFirst)).toBe(true);
  });

  it("keeps Interactive Video separate from the smart types", () => {
    expect(isSameTypeName("Interactive Video", "Smart Interactive Video")).toBe(
      false
    );
    expect(isSameTypeName("Interactive Video", "Interactive Smart Video")).toBe(
      false
    );
  });

  it.each([
    ["PowerPoint", "Interactive Smart PowerPoint"],
    ["PowerPoint", "Smart Interactive PowerPoint"],
    ["video", "Interactive Smart Video"],
    ["video", "Smart Interactive Video"],
    ["PDF", "Interactive Smart PDF"],
    ["pdf", "Smart Interactive PDF"],
  ])("matches the saved name %s with %s", (saved, typeName) => {
    expect(isSameTypeName(saved, typeName)).toBe(true);
  });

  it("does not treat video as Interactive Video", () => {
    expect(isSameTypeName("video", "Interactive Video")).toBe(false);
  });

  it("does not ignore case for other types", () => {
    expect(isSameTypeName("text mcq", "Text MCQ")).toBe(false);
  });

  it("does not match different media", () => {
    expect(
      isSameTypeName("Smart Interactive Video", "Interactive Smart PDF")
    ).toBe(false);
  });
});

describe("findTypeByName", () => {
  // Label values in the Smart Object category, against the type records
  const scenarios = [
    ["mixed spellings", "Smart Interactive", "Interactive Smart"],
    ["Smart Interactive everywhere", "Smart Interactive", "Smart Interactive"],
    ["Interactive Smart everywhere", "Interactive Smart", "Interactive Smart"],
  ];

  describe.each(scenarios)("with %s", (_, labelPrefix, recordPrefix) => {
    it.each(MEDIA)("finds %s and returns the record's name", (media) => {
      const typeName = `${recordPrefix} ${media}`;
      const types = [{ typeName: "Interactive Video" }, { typeName }];

      expect(findTypeByName(types, `${labelPrefix} ${media}`)).toBe(types[1]);
    });
  });

  it("prefers an exact match when both spellings exist", () => {
    const types = [
      { typeName: "Interactive Smart Video" },
      { typeName: "Smart Interactive Video" },
    ];

    expect(findTypeByName(types, "Smart Interactive Video")).toBe(types[1]);
    expect(findTypeByName(types, "Interactive Smart Video")).toBe(types[0]);
  });

  it("finds the smart type for a saved media name", () => {
    const types = [
      { typeName: "Interactive Video" },
      { typeName: "Interactive Smart Video" },
      { typeName: "Interactive Smart PowerPoint" },
    ];

    expect(findTypeByName(types, "video")).toBe(types[1]);
    expect(findTypeByName(types, "PowerPoint")).toBe(types[2]);
  });

  it("does not return Interactive Video for a smart type", () => {
    const types = [{ typeName: "Interactive Video" }];

    expect(findTypeByName(types, "Interactive Smart Video")).toBeUndefined();
  });

  it("returns undefined for missing input", () => {
    const types = [{ typeName: "Text MCQ" }];

    expect(findTypeByName(types, "Unknown")).toBeUndefined();
    expect(findTypeByName(types, null)).toBeUndefined();
    expect(findTypeByName(undefined, "Text MCQ")).toBeUndefined();
  });
});
