/**
 * @file renderMode.test.js
 * @description Tests for StudioAreaSelector's mode resolution, covering the
 * precedence of the original ternary (reader > view-and-play > readOnly >
 * hand-tool > editing-tab > default) it was extracted from.
 */

import { getRenderMode, RENDER_MODES, EDIT_MODE_TAB_IDS } from "../renderMode";

const base = {
  isReaderMode: false,
  readOnly: false,
  showBlocksStyling: true,
  highlight: "",
  activeRightTabId: "block-authoring",
};

describe("getRenderMode", () => {
  it("returns reader mode whenever isReaderMode is true, regardless of other flags", () => {
    expect(
      getRenderMode({ ...base, isReaderMode: true, readOnly: true, showBlocksStyling: false, highlight: "hand" })
    ).toBe(RENDER_MODES.READER);
  });

  it("returns viewAndPlay when styling is hidden and not read-only", () => {
    expect(getRenderMode({ ...base, showBlocksStyling: false })).toBe(RENDER_MODES.VIEW_AND_PLAY);
  });

  it("returns readOnly when readOnly is true, even if styling is hidden", () => {
    expect(getRenderMode({ ...base, readOnly: true, showBlocksStyling: false })).toBe(RENDER_MODES.READ_ONLY);
  });

  it("returns readOnly when readOnly is true and styling is shown", () => {
    expect(getRenderMode({ ...base, readOnly: true })).toBe(RENDER_MODES.READ_ONLY);
  });

  it("returns handTool when highlight is 'hand'", () => {
    expect(getRenderMode({ ...base, highlight: "hand" })).toBe(RENDER_MODES.HAND_TOOL);
  });

  it.each(EDIT_MODE_TAB_IDS)("returns editMode for the %s tab", (tabId) => {
    expect(getRenderMode({ ...base, activeRightTabId: tabId })).toBe(RENDER_MODES.EDIT_MODE);
  });

  it("returns default for a tab outside the editing tabs", () => {
    expect(getRenderMode({ ...base, activeRightTabId: "table-of-contents" })).toBe(RENDER_MODES.DEFAULT);
  });

  it("returns default when activeRightTabId is missing", () => {
    expect(getRenderMode({ ...base, activeRightTabId: undefined })).toBe(RENDER_MODES.DEFAULT);
  });

  it("prioritizes viewAndPlay over handTool and editing tabs", () => {
    expect(
      getRenderMode({ ...base, showBlocksStyling: false, highlight: "hand" })
    ).toBe(RENDER_MODES.VIEW_AND_PLAY);
  });

  it("prioritizes handTool over editing tabs", () => {
    expect(
      getRenderMode({ ...base, highlight: "hand", activeRightTabId: "block-authoring" })
    ).toBe(RENDER_MODES.HAND_TOOL);
  });
});
