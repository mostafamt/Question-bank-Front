/**
 * @file blockActions.js
 * @description Which right-click menu actions apply to a block. Studio rules
 * match the icon buttons in the block list (components/AreaAction), reader
 * rules match ReaderModeRenderer (only saved blocks are clickable).
 */

export const SIMPLE_ITEM = "Simple item";

export const BLOCK_ACTIONS = {
  PLAY: "play",
  EDIT: "edit",
  SHOW_IN_LIST: "show-in-list",
  DELETE: "delete",
};

/**
 * @param {Object} areaProps - The block's areasProperties entry
 * @param {Object} options
 * @param {boolean} options.isReaderMode
 * @param {boolean} options.canShowInList - The block list is on screen (block-authoring tab)
 * @returns {string[]} BLOCK_ACTIONS values, in menu order
 */
export function getBlockActions(areaProps, { isReaderMode, canShowInList }) {
  if (!areaProps) return [];

  if (isReaderMode) {
    return areaProps.blockId ? [BLOCK_ACTIONS.PLAY] : [];
  }

  const actions = [];
  if (areaProps.type && areaProps.type !== SIMPLE_ITEM) {
    actions.push(BLOCK_ACTIONS.PLAY);
  }
  if (areaProps.type) actions.push(BLOCK_ACTIONS.EDIT);
  if (canShowInList) actions.push(BLOCK_ACTIONS.SHOW_IN_LIST);
  actions.push(BLOCK_ACTIONS.DELETE);
  return actions;
}

export default getBlockActions;
