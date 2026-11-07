import { findTypeByName, isSameTypeName, isSmartObject } from "./typeName";

describe("isSameTypeName", () => {
  it.each([
    ["PowerPoint", "Interactive Smart PowerPoint"],
    ["video", "Interactive Smart Video"],
    ["PDF", "Interactive Smart PDF"],
    ["pdf", "Interactive Smart PDF"],
  ])("matches the saved name %s with %s", (saved, typeName) => {
    expect(isSameTypeName(saved, typeName)).toBe(true);
    expect(isSameTypeName(typeName, saved)).toBe(true);
  });

  it("does not treat video as Interactive Video", () => {
    expect(isSameTypeName("video", "Interactive Video")).toBe(false);
  });

  it("does not ignore case for other types", () => {
    expect(isSameTypeName("text mcq", "Text MCQ")).toBe(false);
  });

  it("does not match different media", () => {
    expect(isSameTypeName("video", "Interactive Smart PDF")).toBe(false);
  });
});

describe("findTypeByName", () => {
  it("finds a type by its exact name", () => {
    const types = [
      { typeName: "Interactive Video" },
      { typeName: "Interactive Smart Video" },
    ];

    expect(findTypeByName(types, "Interactive Smart Video")).toBe(types[1]);
  });

  it("prefers the type over a category with the same name", () => {
    const types = [
      { typeName: "Simulation Object", typeCategory: "B" },
      { typeName: "Simulation Object", abstractParameter: { _File_: "html" } },
    ];

    expect(findTypeByName(types, "Simulation Object")).toBe(types[1]);
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
});

describe("isSmartObject", () => {
  it.each([
    "Interactive Smart Video",
    "Interactive Smart PDF",
    "Interactive Smart PowerPoint",
    "video",
    "PowerPoint",
    "pdf",
  ])("is true for the type %s", (type) => {
    expect(isSmartObject({ type })).toBe(true);
  });

  it.each(["Smart Object", "Smart"])("is true for the category %s", (category) => {
    expect(isSmartObject({ type: "Text MCQ", category })).toBe(true);
  });

  it("is false for other objects", () => {
    expect(isSmartObject({ type: "MultipleChoice", category: "Question" })).toBe(false);
    expect(isSmartObject({ type: "Interactive Video" })).toBe(false);
  });

  it("is false without an object", () => {
    expect(isSmartObject(null)).toBe(false);
    expect(isSmartObject(undefined)).toBe(false);
  });
});
