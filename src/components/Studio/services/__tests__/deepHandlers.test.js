/**
 * Tests for deep block handlers
 */

import {
  getDeepHandler,
  getDeepBlockText,
  getDeepBlockImage,
} from "../deepHandlers.service";
import { STUDIO_MODALS } from "../modal.service";

const makeArea = (overrides = {}) => ({
  id: "area-1",
  blockId: "block-1",
  type: "Question",
  text: "",
  ...overrides,
});

describe("getDeepHandler", () => {
  it.each(["text", "image"])(
    "returns a handler for a deep %s block",
    (labelType) => {
      expect(getDeepHandler(makeArea({ isDeep: true }), labelType)).toEqual(
        expect.any(Function)
      );
    }
  );

  it.each(["text", "image"])(
    "returns null for a non-deep %s block",
    (labelType) => {
      expect(getDeepHandler(makeArea({ isDeep: false }), labelType)).toBeNull();
    }
  );

  // Blocks saved before the isDeep flag existed have no key at all.
  it("returns null for a legacy block with no isDeep key", () => {
    expect(getDeepHandler(makeArea(), "text")).toBeNull();
  });

  it.each(["number", "Coordinate", ""])(
    "returns null for a deep block with no handler registered for %s",
    (labelType) => {
      expect(getDeepHandler(makeArea({ isDeep: true }), labelType)).toBeNull();
    }
  );
});

describe("getDeepBlockText", () => {
  it("returns the text of a deep text block", () => {
    expect(
      getDeepBlockText(
        makeArea({ isDeep: true, typeOfLabel: "text", text: "<p>hi</p>" })
      )
    ).toBe("<p>hi</p>");
  });

  it("returns empty for a deep text block with no text yet", () => {
    expect(getDeepBlockText(makeArea({ isDeep: true, typeOfLabel: "text" }))).toBe(
      ""
    );
  });

  // An OCR'd block's text belongs in the side panel, not painted over the scan.
  it("returns empty for a non-deep text block", () => {
    expect(
      getDeepBlockText(makeArea({ typeOfLabel: "text", text: "ocr'd" }))
    ).toBe("");
  });

  it.each(["number", "Coordinate", "image", undefined])(
    "returns empty for a deep block of typeOfLabel %s",
    (typeOfLabel) => {
      expect(
        getDeepBlockText(makeArea({ isDeep: true, typeOfLabel, text: "x" }))
      ).toBe("");
    }
  );

  it.each([[undefined], [null]])("returns empty for a missing area", (area) => {
    expect(getDeepBlockText(area)).toBe("");
  });
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

describe("getDeepBlockImage", () => {
  it("returns the url of a deep image block with a hosted url", () => {
    expect(
      getDeepBlockImage(
        makeArea({
          isDeep: true,
          typeOfLabel: "image",
          image: "https://cdn.example.com/x.png",
        })
      )
    ).toBe("https://cdn.example.com/x.png");
  });

  // A data: crop is the raw scan, not a chosen replacement — not painted.
  it("returns empty for a deep image block still holding a data: crop", () => {
    expect(
      getDeepBlockImage(
        makeArea({
          isDeep: true,
          typeOfLabel: "image",
          image: "data:image/png;base64,xxx",
        })
      )
    ).toBe("");
  });

  it("returns empty for a non-deep image block", () => {
    expect(
      getDeepBlockImage(
        makeArea({ typeOfLabel: "image", image: "https://x.com/a.png" })
      )
    ).toBe("");
  });

  it.each(["text", "number", "Coordinate", undefined])(
    "returns empty for a deep block of typeOfLabel %s",
    (typeOfLabel) => {
      expect(
        getDeepBlockImage(
          makeArea({ isDeep: true, typeOfLabel, image: "https://x.com/a.png" })
        )
      ).toBe("");
    }
  );

  it.each([[undefined], [null]])("returns empty for a missing area", (area) => {
    expect(getDeepBlockImage(area)).toBe("");
  });
});

describe("deep image handler", () => {
  const invoke = (area, context = {}) => {
    const openModal = jest.fn();
    const handler = getDeepHandler(area, "image");
    handler({
      area,
      idx: 0,
      labelType: "image",
      image: area.image,
      updateAreaPropertyById: jest.fn(),
      openModal,
      ...context,
    });
    return openModal;
  };

  it("opens the deep image modal", () => {
    const openModal = invoke(makeArea({ isDeep: true, typeOfLabel: "image" }));

    expect(openModal).toHaveBeenCalledTimes(1);
    expect(openModal.mock.calls[0][0]).toBe(STUDIO_MODALS.DEEP_IMAGE);
  });

  it("passes the area id and current image to the modal", () => {
    const openModal = invoke(
      makeArea({
        isDeep: true,
        typeOfLabel: "image",
        id: "area-9",
        image: "https://x.com/a.png",
      })
    );

    expect(openModal.mock.calls[0][1].workingArea).toEqual({
      id: "area-9",
      image: "https://x.com/a.png",
    });
  });

  it("forwards the update callback to the modal", () => {
    const updateAreaPropertyById = jest.fn();
    const openModal = invoke(
      makeArea({ isDeep: true, typeOfLabel: "image" }),
      { updateAreaPropertyById }
    );

    openModal.mock.calls[0][1].updateAreaPropertyById("area-1", {
      image: "https://x.com/a.png",
    });

    expect(updateAreaPropertyById).toHaveBeenCalledWith("area-1", {
      image: "https://x.com/a.png",
    });
  });
});
