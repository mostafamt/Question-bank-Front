import { getSchema } from "./auto-ui";

// The package's entry point can't be resolved by Jest
jest.mock(
  "react-audio-voice-recorder",
  () => ({ AudioRecorder: () => null, useAudioRecorder: () => ({}) }),
  { virtual: true }
);

// Returns { path: message } for every error, or {} when the values are valid
const validate = async (abstractParameters, labels, values) => {
  try {
    await getSchema(abstractParameters, labels).validate(values, {
      abortEarly: false,
    });
    return {};
  } catch (error) {
    return Object.fromEntries(error.inner.map((e) => [e.path, e.message]));
  }
};

describe("getSchema", () => {
  const imageType = { _Image_: "image" };
  const requiredImage = [{ "*_Image_": "image" }];

  it("requires a required file field", async () => {
    expect(await validate(imageType, requiredImage, { _Image_: "" })).toEqual({
      _Image_: "Image is required",
    });
  });

  it("rejects a file field that is not a link", async () => {
    expect(
      await validate(imageType, requiredImage, { _Image_: "not a url" })
    ).toEqual({ _Image_: "Image must be a valid http(s) URL" });
  });

  it("checks optional file links only when filled", async () => {
    const labels = [{ _Image_: "image" }];
    expect(await validate(imageType, labels, { _Image_: "" })).toEqual({});
    expect(await validate(imageType, labels, { _Image_: "ftp://x" })).toEqual({
      _Image_: "Image must be a valid http(s) URL",
    });
  });

  it("validates a required array and its items", async () => {
    const params = { "Questions 2": [{ _Text_: "text" }] };
    const labels = [{ "*Questions 2": "text" }, { "*_Text_": "text" }];

    expect(
      await validate(params, labels, { "Questions 2": [{ _Text_: "a" }] })
    ).toEqual({ "Questions 2": "Questions needs at least 2 items" });

    expect(
      await validate(params, labels, {
        "Questions 2": [{ _Text_: "a" }, { _Text_: " " }],
      })
    ).toEqual({ "Questions 2[1]._Text_": "Text is required" });
  });

  it("accepts an unchecked required checkbox", async () => {
    expect(
      await validate({ _Correct_: "Bool" }, [{ "*_Correct_": "Bool" }], {
        _Correct_: false,
      })
    ).toEqual({});
  });

  it("treats an empty rich text editor as empty", async () => {
    expect(
      await validate(
        { _Body_: "QuillInput" },
        [{ "*_Body_": "QuillInput" }],
        { _Body_: "<p><br></p>" }
      )
    ).toEqual({ _Body_: "Body is required" });
  });

  it("requires pages for a required pdf", async () => {
    expect(
      await validate({ _Doc_: "pdf" }, [{ "*_Doc_": "pdf" }], {
        _Doc_: { url: "https://bucket/a.pdf", pages: [] },
      })
    ).toEqual({ _Doc_: "PDF is required" });
  });

  it("rejects a non-number in a number field", async () => {
    expect(
      await validate({ _X_: "number" }, [{ _X_: "number" }], { _X_: "abc" })
    ).toEqual({ _X_: "X must be a number" });
  });

  describe("one-of groups", () => {
    const params = { _Image_: "image", _Video_: "video" };
    const labels = [{ "?*_Image_": "image" }, { "?_Video_": "video" }];

    it("fails on every option when none is filled", async () => {
      expect(
        await validate(params, labels, { _Image_: "", _Video_: "" })
      ).toEqual({
        _Image_: "Fill one of: Image, Video",
        _Video_: "Fill one of: Image, Video",
      });
    });

    it("passes when one option is filled", async () => {
      expect(
        await validate(params, labels, {
          _Image_: "",
          _Video_: "https://bucket/a.mp4",
        })
      ).toEqual({});
    });
  });

  it("does not change the submitted values", async () => {
    const values = { _X_: "5", _Image_: " https://bucket/a.png" };
    const result = await getSchema(
      { _X_: "number", _Image_: "image" },
      []
    ).validate(values);
    expect(result).toEqual(values);
  });
});
