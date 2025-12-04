import { v4 as uuidv4 } from "uuid";

export const NOTES = "Notes 📝";
export const SUMMARY = "Summary 📋";

export const VIRTUAL_BLOCK_MENU = [
  {
    id: uuidv4(),
    label: "Overview 🧭",
    iconSrc: "/assets/compass.svg",
    category: "object",
  },
  {
    id: uuidv4(),
    label: NOTES,
    iconSrc: "/assets/memo.svg",
    category: "text",
  },
  {
    id: uuidv4(),
    label: "Recall 🧠",
    iconSrc: "/assets/brain.svg",
    category: "object",
  },
  {
    id: uuidv4(),
    label: "Example 🔍",
    iconSrc: "/assets/magnifying-glass.svg",
    category: "object",
  },
  {
    id: uuidv4(),
    label: "Check Yourself ✅",
    iconSrc: "/assets/check-mark-button.svg",
    category: "object",
  },
  {
    id: uuidv4(),
    label: "Quizz ❓",
    iconSrc: "/assets/red-question-mark.svg",
    category: "object",
  },
  {
    id: uuidv4(),
    label: "Activity 🏃‍♂️",
    iconSrc: "/assets/man-running.svg",
    category: "object",
  },
  {
    id: uuidv4(),
    label: "Enriching Content 🌟",
    iconSrc: "/assets/glowing-star.svg",
    category: "object",
  },
  {
    id: uuidv4(),
    label: SUMMARY,
    iconSrc: "/assets/clipboard.svg",
    category: "text",
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
    contentType: "",
  },
  TM: {
    label: "",
    id: "",
    status: "",
    contentType: "",
  },
  TR: {
    label: "",
    id: "",
    status: "",
    contentType: "",
  },
  L1: {
    label: "",
    id: "",
    status: "",
    contentType: "",
  },
  L2: {
    label: "",
    id: "",
    status: "",
    contentType: "",
  },
  L3: {
    label: "",
    id: "",
    status: "",
    contentType: "",
  },
  L4: {
    label: "",
    id: "",
    status: "",
    contentType: "",
  },
  L5: {
    label: "",
    id: "",
    status: "",
    contentType: "",
  },
  L6: {
    label: "",
    id: "",
    status: "",
    contentType: "",
  },
  R1: {
    label: "",
    id: "",
    status: "",
    contentType: "",
  },
  R2: {
    label: "",
    id: "",
    status: "",
    contentType: "",
  },
  R3: {
    label: "",
    id: "",
    status: "",
    contentType: "",
  },
  R4: {
    label: "",
    id: "",
    status: "",
    contentType: "",
  },
  R5: {
    label: "",
    id: "",
    status: "",
    contentType: "",
  },
  R6: {
    label: "",
    id: "",
    status: "",
    contentType: "",
  },
  BL: {
    label: "",
    id: "",
    status: "",
    contentType: "",
  },
  BM: {
    label: "",
    id: "",
    status: "",
    contentType: "",
  },
  BR: {
    label: "",
    id: "",
    status: "",
    contentType: "",
  },
};

/**
 * Infer content type from block data for backward compatibility
 * @param {Object} block - Virtual block data
 * @returns {string} - Content type: 'text', 'link', or 'object'
 */
const inferContentType = (block) => {
  // If contentFormat is already specified, use it
  if (block.contentFormat) {
    return block.contentFormat;
  }

  // Check if it's a known text block
  if (block.contentType === NOTES || block.contentType === SUMMARY) {
    return "text";
  }

  // Check if contentValue is a URL pattern
  if (
    block.contentValue &&
    typeof block.contentValue === "string" &&
    /^https?:\/\//.test(block.contentValue)
  ) {
    return "link";
  }

  // Default to object (interactive content)
  return "object";
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
        contentType: inferContentType(v_block),
      };
    });

    return vBlocks;
  });

  return virtualBlocksPages;
};

export const parseVirtualBlocksFromActivePage = (page) => {
  const vBlocks = { ...VIRTUAL_BLOCKS };
  page?.v_blocks?.forEach((v_block) => {
    const iconLocation = v_block.iconLocation;
    vBlocks[iconLocation] = {
      id: v_block.contentValue,
      label: v_block.contentType,
      status: SERVER,
      contentType: inferContentType(v_block),
    };
  });

  return vBlocks;
};
