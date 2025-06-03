import { v4 as uuidv4 } from "uuid";

export const VIRTUAL_BLOCK_MENU = [
  {
    id: uuidv4(),
    label: "Overview 🧭",
    iconSrc: "/assets/compass.svg",
  },
  {
    id: uuidv4(),
    label: "Notes 📝",
    iconSrc: "/assets/memo.svg",
  },
  {
    id: uuidv4(),
    label: "Recall 🧠",
    iconSrc: "/assets/brain.svg",
  },
  {
    id: uuidv4(),
    label: "Example 🔍",
    iconSrc: "/assets/magnifying-glass.svg",
  },
  {
    id: uuidv4(),
    label: "Check Yourself ✅",
    iconSrc: "/assets/check-mark-button.svg",
  },
  {
    id: uuidv4(),
    label: "Quizz ❓",
    iconSrc: "/assets/red-question-mark.svg",
  },
  {
    id: uuidv4(),
    label: "Activity 🏃‍♂️",
    iconSrc: "/assets/man-running.svg",
  },
  {
    id: uuidv4(),
    label: "Enriching Content 🌟",
    iconSrc: "/assets/glowing-star.svg",
  },
  {
    id: uuidv4(),
    label: "Summary 📋",
    iconSrc: "/assets/clipboard.svg",
  },
];

export const NUM_OF_VIRUTAL_BLOCKS = 18;
export const SERVER = "updated";
export const CREATED = "new";
export const DELETED = "deleted";

export const VIRTUAL_BLOCKS = {
  TL: {
    label: "",
    id: "",
    status: "",
  },
  TM: {
    label: "",
    id: "",
    status: "",
  },
  TR: {
    label: "",
    id: "",
    status: "",
  },
  L1: {
    label: "",
    id: "",
    status: "",
  },
  L2: {
    label: "",
    id: "",
    status: "",
  },
  L3: {
    label: "",
    id: "",
    status: "",
  },
  L4: {
    label: "",
    id: "",
    status: "",
  },
  L5: {
    label: "",
    id: "",
    status: "",
  },
  L6: {
    label: "",
    id: "",
    status: "",
  },
  R1: {
    label: "",
    id: "",
    status: "",
  },
  R2: {
    label: "",
    id: "",
    status: "",
  },
  R3: {
    label: "",
    id: "",
    status: "",
  },
  R4: {
    label: "",
    id: "",
    status: "",
  },
  R5: {
    label: "",
    id: "",
    status: "",
  },
  R6: {
    label: "",
    id: "",
    status: "",
  },
  BL: {
    label: "",
    id: "",
    status: "",
  },
  BM: {
    label: "",
    id: "",
    status: "",
  },
  BR: {
    label: "",
    id: "",
    status: "",
  },
};

export const parseVirtualBlocksFromPages = (pages) => {
  const virtualBlocksPages = pages?.map((page) => {
    const vBlocks = { ...VIRTUAL_BLOCKS };
    page.v_blocks.forEach((v_block) => {
      const iconLocation = v_block.iconLocation;
      vBlocks[iconLocation] = {
        id: v_block.contentValue,
        label: v_block.contentType,
        status: SERVER,
      };
    });

    return vBlocks;
  });

  return virtualBlocksPages;
};
