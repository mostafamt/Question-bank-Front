import { isObjectId } from "../objectId";
import { determineModalForArea, STUDIO_MODALS } from "../../components/Studio/services/modal.service";

const OBJECT_ID = "6ac43b86aa141d0004485980";

describe("isObjectId", () => {
  it("accepts a 24-character hex id", () => {
    expect(isObjectId(OBJECT_ID)).toBe(true);
    expect(isObjectId(OBJECT_ID.toUpperCase())).toBe(true);
    expect(isObjectId(` ${OBJECT_ID} `)).toBe(true);
  });

  it("rejects non-id content values", () => {
    expect(isObjectId("https://bucket.s3.amazonaws.com/video.mp4")).toBe(false);
    expect(isObjectId("Cell structure")).toBe(false);
    expect(isObjectId(OBJECT_ID.slice(1))).toBe(false);
    expect(isObjectId(`${OBJECT_ID}a`)).toBe(false);
    expect(isObjectId("")).toBe(false);
    expect(isObjectId(null)).toBe(false);
    expect(isObjectId(undefined)).toBe(false);
  });
});

describe("determineModalForArea", () => {
  it("plays an object id as an object regardless of its label", () => {
    expect(
      determineModalForArea({ text: OBJECT_ID, label: "Interactive Smart Video", typeOfLabel: "video" })
    ).toEqual({ modalName: STUDIO_MODALS.PLAY_OBJECT, isComplex: true });
  });

  it("opens non-id content in the quill modal", () => {
    expect(
      determineModalForArea({ text: "Some paragraph", typeOfLabel: "text" })
    ).toEqual({ modalName: STUDIO_MODALS.QUILL, isComplex: false });
  });
});
