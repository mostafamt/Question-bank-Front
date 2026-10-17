/**
 * @file blockActions.test.js
 * @description Tests for which right-click menu actions a block gets.
 */

import { getBlockActions, BLOCK_ACTIONS, SIMPLE_ITEM } from "../blockActions";

const { PLAY, EDIT, SHOW_IN_LIST, DELETE } = BLOCK_ACTIONS;
const studio = { isReaderMode: false, canShowInList: true };
const reader = { isReaderMode: true, canShowInList: false };

describe("getBlockActions", () => {
  it("returns nothing without area properties", () => {
    expect(getBlockActions(undefined, studio)).toEqual([]);
  });

  describe("studio", () => {
    it("gives a complex block every action", () => {
      expect(getBlockActions({ type: "MCQ" }, studio)).toEqual([
        PLAY,
        EDIT,
        SHOW_IN_LIST,
        DELETE,
      ]);
    });

    it("gives a Simple item no Play", () => {
      expect(getBlockActions({ type: SIMPLE_ITEM }, studio)).toEqual([
        EDIT,
        SHOW_IN_LIST,
        DELETE,
      ]);
    });

    it("gives an untyped block only Show in list and Delete", () => {
      expect(getBlockActions({ type: "" }, studio)).toEqual([
        SHOW_IN_LIST,
        DELETE,
      ]);
    });

    it("leaves out Show in list when the list isn't on screen", () => {
      expect(
        getBlockActions({ type: "MCQ" }, { ...studio, canShowInList: false })
      ).toEqual([PLAY, EDIT, DELETE]);
    });
  });

  describe("reader", () => {
    it("gives a saved block only Play", () => {
      expect(getBlockActions({ type: "MCQ", blockId: "b1" }, reader)).toEqual([
        PLAY,
      ]);
    });

    it("gives an unsaved block nothing", () => {
      expect(getBlockActions({ type: "MCQ" }, reader)).toEqual([]);
    });
  });
});
