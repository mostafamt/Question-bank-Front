/**
 * @file renderMode.js
 * @description Pure mode resolution for StudioAreaSelector, extracted from the
 * component's render ternary. Precedence must match the original conditions
 * exactly: reader > view-and-play > readOnly > hand-tool > editing-tab > default.
 */

/**
 * Right-panel tab ids that render the interactive `AreaSelector` (drawing/resizing) mode.
 */
export const EDIT_MODE_TAB_IDS = [
  "block-authoring",
  "composite-blocks",
  "glossary-keywords",
  "illustrative-interactions",
];

export const RENDER_MODES = {
  READER: "reader",
  VIEW_AND_PLAY: "viewAndPlay",
  READ_ONLY: "readOnly",
  HAND_TOOL: "handTool",
  EDIT_MODE: "editMode",
  DEFAULT: "default",
};

/**
 * Resolve which of StudioAreaSelector's six render modes applies.
 * @param {Object} params
 * @param {boolean} params.isReaderMode - App is in reader mode (from useAppMode)
 * @param {boolean} params.readOnly - Component rendered in read-only preview (e.g. CompositeBlocksModal)
 * @param {boolean} params.showBlocksStyling - Whether block borders/backgrounds are shown
 * @param {string} params.highlight - Current highlight/interaction mode ('' | 'hand')
 * @param {string} [params.activeRightTabId] - id of the currently active right-panel tab
 * @returns {string} One of RENDER_MODES
 */
export function getRenderMode({
  isReaderMode,
  readOnly,
  showBlocksStyling,
  highlight,
  activeRightTabId,
}) {
  if (isReaderMode) return RENDER_MODES.READER;
  if (!showBlocksStyling && !readOnly) return RENDER_MODES.VIEW_AND_PLAY;
  if (readOnly) return RENDER_MODES.READ_ONLY;
  if (highlight === "hand") return RENDER_MODES.HAND_TOOL;
  if (EDIT_MODE_TAB_IDS.includes(activeRightTabId)) return RENDER_MODES.EDIT_MODE;
  return RENDER_MODES.DEFAULT;
}

export default getRenderMode;
