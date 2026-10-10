/**
 * Tests for changing the type of a virtual block
 */

import {
  changeVirtualBlockType,
  getVirtualBlockMenuItem,
  formatVirtualBlocksForSubmission,
  parseVirtualBlocksFromActivePage,
  VIRTUAL_BLOCKS,
  NOTES,
  SUMMARY,
} from "../virtual-blocks";

const makeItem = (overrides = {}) => ({
  type: "text",
  iconLocation: "TL",
  contentType: NOTES,
  contentValue: "<p>note</p>",
  ...overrides,
});

describe("changeVirtualBlockType", () => {
  it("relabels every item and keeps other fields", () => {
    const contents = [
      makeItem({ id: "rb_1", createdAt: 1 }),
      makeItem({
        type: "autogen",
        contentValue: "",
        jobId: "job-1",
        status: "pending",
        objectId: null,
        cropRect: { x: 1, y: 2, w: 3, h: 4 },
      }),
    ];

    const result = changeVirtualBlockType(contents, SUMMARY);

    expect(result).toHaveLength(2);
    result.forEach((item) => expect(item.contentType).toBe(SUMMARY));
    expect(result[0]).toMatchObject({ id: "rb_1", createdAt: 1, type: "text" });
    expect(result[1]).toMatchObject({
      type: "autogen",
      jobId: "job-1",
      status: "pending",
      cropRect: { x: 1, y: 2, w: 3, h: 4 },
    });
    // Input is not mutated
    expect(contents[0].contentType).toBe(NOTES);
  });

  it("returns the same reference when the label is unchanged", () => {
    const contents = [makeItem(), makeItem()];
    expect(changeVirtualBlockType(contents, NOTES)).toBe(contents);
  });

  it("handles empty or missing input", () => {
    expect(changeVirtualBlockType([], SUMMARY)).toEqual([]);
    expect(changeVirtualBlockType(undefined, SUMMARY)).toEqual([]);
    const contents = [makeItem()];
    expect(changeVirtualBlockType(contents, "")).toBe(contents);
  });

  it("survives a submit/parse round trip", () => {
    const relabelled = changeVirtualBlockType(
      [makeItem(), makeItem({ type: "link", contentValue: "https://x.y" })],
      SUMMARY
    );
    const formatted = formatVirtualBlocksForSubmission(
      { ...VIRTUAL_BLOCKS, TL: { contents: relabelled } },
      "page-1"
    );
    const parsed = parseVirtualBlocksFromActivePage({ v_blocks: [formatted] });

    expect(parsed.TL.contents).toHaveLength(2);
    parsed.TL.contents.forEach((item) =>
      expect(item.contentType).toBe(SUMMARY)
    );
    expect(parsed.TL.contents[1].type).toBe("link");
  });
});

describe("getVirtualBlockMenuItem", () => {
  it("finds a menu entry by label", () => {
    expect(getVirtualBlockMenuItem(NOTES)?.iconSrc).toBe("/assets/memo.svg");
  });

  it("returns undefined for unknown labels", () => {
    expect(getVirtualBlockMenuItem("Recall")).toBeUndefined();
  });
});
