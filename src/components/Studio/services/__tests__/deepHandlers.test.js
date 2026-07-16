/**
 * Tests for deep block handlers
 */

import { getDeepHandler } from "../deepHandlers.service";
import { STUDIO_MODALS } from "../modal.service";

const makeArea = (overrides = {}) => ({
  id: "area-1",
  blockId: "block-1",
  type: "Question",
  text: "",
  ...overrides,
});

describe("getDeepHandler", () => {
  it("returns a handler for a deep text block", () => {
    expect(getDeepHandler(makeArea({ isDeep: true }), "text")).toEqual(
      expect.any(Function)
    );
  });

  it("returns null for a non-deep text block", () => {
    expect(getDeepHandler(makeArea({ isDeep: false }), "text")).toBeNull();
  });

  // Blocks saved before the isDeep flag existed have no key at all.
  it("returns null for a legacy block with no isDeep key", () => {
    expect(getDeepHandler(makeArea(), "text")).toBeNull();
  });

  it.each(["number", "Coordinate", "image", ""])(
    "returns null for a deep block with no handler registered for %s",
    (labelType) => {
      expect(getDeepHandler(makeArea({ isDeep: true }), labelType)).toBeNull();
    }
  );
});

describe("deep text handler", () => {
  const invoke = (area, context = {}) => {
    const openModal = jest.fn();
    const handler = getDeepHandler(area, "text");
    handler({
      area,
      idx: 0,
      labelType: "text",
      image: "data:image/png;base64,xxx",
      updateAreaPropertyById: jest.fn(),
      openModal,
      ...context,
    });
    return openModal;
  };

  it("opens the quill modal", () => {
    const openModal = invoke(makeArea({ isDeep: true }));

    expect(openModal).toHaveBeenCalledTimes(1);
    expect(openModal.mock.calls[0][0]).toBe(STUDIO_MODALS.QUILL);
  });

  // QuillModal writes back with workingArea.id — without it the editor silently
  // updates nothing.
  it("passes the area id so the editor can write back", () => {
    const openModal = invoke(makeArea({ isDeep: true, id: "area-7" }));

    expect(openModal.mock.calls[0][1].workingArea.id).toBe("area-7");
  });

  it("seeds the editor with the block's existing text", () => {
    const openModal = invoke(makeArea({ isDeep: true, text: "<p>hi</p>" }));

    expect(openModal.mock.calls[0][1].workingArea).toMatchObject({
      text: "<p>hi</p>",
      typeOfLabel: "text",
      contentType: "Question",
      blockId: "block-1",
    });
  });

  // typeOfLabel "text" makes QuillModal read workingArea.text; an image on the
  // props would just be dead weight.
  it("does not pass the cropped image", () => {
    const openModal = invoke(makeArea({ isDeep: true }));

    expect(openModal.mock.calls[0][1].workingArea.image).toBeUndefined();
  });

  it("forwards the update callback to the modal", () => {
    const updateAreaPropertyById = jest.fn();
    const openModal = invoke(makeArea({ isDeep: true }), {
      updateAreaPropertyById,
    });

    openModal.mock.calls[0][1].updateAreaPropertyById("area-1", { text: "x" });

    expect(updateAreaPropertyById).toHaveBeenCalledWith("area-1", { text: "x" });
  });
});
