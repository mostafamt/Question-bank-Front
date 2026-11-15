import { acceptFor, FILE_RULES, validateFile } from "./fileTypes";

const makeFile = (name, type = "", size = 10) => {
  const file = new File(["x"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
};

describe("validateFile", () => {
  it("accepts a matching file regardless of extension case", () => {
    expect(validateFile(makeFile("a.PNG", "image/png"), "image")).toBeNull();
  });

  it("rejects a file of another type", () => {
    expect(validateFile(makeFile("a.pdf", "application/pdf"), "image")).toBe(
      "Only Image files are allowed (.jpg, .jpeg, .png, .gif, .webp, .svg)"
    );
  });

  it("rejects a renamed file whose content type does not match", () => {
    expect(
      validateFile(makeFile("evil.png", "text/html"), "image")
    ).toMatch(/Only Image files/);
  });

  it("falls back to the extension when the browser reports no type", () => {
    expect(validateFile(makeFile("deck.pptx", ""), "ppt")).toBeNull();
  });

  it("rejects files over the size limit", () => {
    const size = FILE_RULES.pdf.maxMB * 1024 * 1024 + 1;
    expect(validateFile(makeFile("a.pdf", "application/pdf", size), "pdf")).toBe(
      "File is too large (max 20 MB)"
    );
  });

  it("accepts webm audio reported as video", () => {
    expect(validateFile(makeFile("a.webm", "video/webm"), "audio")).toBeNull();
  });

  it("uses the same rules for voice and audio", () => {
    expect(FILE_RULES.voice).toBe(FILE_RULES.audio);
  });

  it("rejects a missing file", () => {
    expect(validateFile(undefined, "html")).toBe("Please choose a file");
  });
});

describe("acceptFor", () => {
  it("lists extensions and exact types", () => {
    expect(acceptFor("html")).toBe(".html,.htm,text/html");
  });
});
