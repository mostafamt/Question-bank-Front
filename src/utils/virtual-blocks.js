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
  TL: { contents: [] },
  TM: { contents: [] },
  TR: { contents: [] },
  L1: { contents: [] },
  L2: { contents: [] },
  L3: { contents: [] },
  L4: { contents: [] },
  L5: { contents: [] },
  L6: { contents: [] },
  R1: { contents: [] },
  R2: { contents: [] },
  R3: { contents: [] },
  R4: { contents: [] },
  R5: { contents: [] },
  R6: { contents: [] },
  BL: { contents: [] },
  BM: { contents: [] },
  BR: { contents: [] },
};

/**
 * Add content item to a specific location
 * @param {Object} virtualBlocks - Virtual blocks state object
 * @param {string} location - Icon location (TL, TM, TR, L1-R6, BL, BM, BR)
 * @param {Object} contentItem - Content item to add
 * @param {string} contentItem.type - Content type: 'text', 'link', or 'object'
 * @param {string} contentItem.contentType - Block label (e.g., 'Notes 📝', 'Recall')
 * @param {string} contentItem.contentValue - Content value (HTML, URL, or object ID)
 * @returns {Object} - Updated virtualBlocks object
 */
export const addContentToLocation = (virtualBlocks, location, contentItem) => {
  const newVirtualBlocks = { ...virtualBlocks };

  if (!newVirtualBlocks[location]) {
    newVirtualBlocks[location] = { contents: [] };
  }

  const newContentItem = {
    ...contentItem,
    iconLocation: location,
  };

  newVirtualBlocks[location] = {
    contents: [...(newVirtualBlocks[location].contents || []), newContentItem],
  };

  return newVirtualBlocks;
};

/**
 * Remove content item from a location by index
 * @param {Object} virtualBlocks - Virtual blocks state object
 * @param {string} location - Icon location
 * @param {number} index - Index of content item to remove
 * @returns {Object} - Updated virtualBlocks object
 */
export const removeContentFromLocation = (virtualBlocks, location, index) => {
  const newVirtualBlocks = { ...virtualBlocks };

  if (newVirtualBlocks[location] && newVirtualBlocks[location].contents) {
    const newContents = [...newVirtualBlocks[location].contents];
    newContents.splice(index, 1);
    newVirtualBlocks[location] = { contents: newContents };
  }

  return newVirtualBlocks;
};

/**
 * Update content item at a location by index
 * @param {Object} virtualBlocks - Virtual blocks state object
 * @param {string} location - Icon location
 * @param {number} index - Index of content item to update
 * @param {Object} updates - Partial updates to apply
 * @returns {Object} - Updated virtualBlocks object
 */
export const updateContentAtLocation = (virtualBlocks, location, index, updates) => {
  const newVirtualBlocks = { ...virtualBlocks };

  if (newVirtualBlocks[location] && newVirtualBlocks[location].contents[index]) {
    const newContents = [...newVirtualBlocks[location].contents];
    newContents[index] = {
      ...newContents[index],
      ...updates,
    };
    newVirtualBlocks[location] = { contents: newContents };
  }

  return newVirtualBlocks;
};

/**
 * Format virtualBlocks for API submission
 * @param {Object} virtualBlocks - Virtual blocks state object
 * @param {string} pageId - Page ID
 * @returns {Object|null} - Formatted v_blocks object or null if no contents
 */
export const formatVirtualBlocksForSubmission = (virtualBlocks, pageId) => {
  const contents = [];

  // Iterate through all locations
  Object.entries(virtualBlocks).forEach(([location, data]) => {
    if (data.contents && data.contents.length > 0) {
      // Add each content item with iconLocation
      data.contents.forEach((item) => {
        const entry = {
          type: item.type,
          iconLocation: location,
          contentType: item.contentType,
          contentValue: item.contentValue,
        };
        // Preserve autogen-specific fields so pending jobs survive a save/reload
        if (item.type === "autogen") {
          entry.jobId = item.jobId || null;
          entry.status = item.status || "pending";
          entry.objectId = item.objectId || null;
          entry.errorMessage = item.errorMessage || null;
          entry.cropRect = item.cropRect || null;
        }
        contents.push(entry);
      });
    }
  });

  return contents.length > 0
    ? {
        pageId: pageId,
        contents: contents,
      }
    : null;
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

  // If type is explicitly set, use it
  if (block.type) {
    return block.type;
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

/**
 * Migrate legacy virtual blocks to new structure
 * Converts old single-item structure to new multi-item contents array
 * @param {Object} oldVirtualBlocks - Legacy virtual blocks object
 * @returns {Object} - Migrated virtualBlocks with contents arrays
 */
export const migrateLegacyVirtualBlocks = (oldVirtualBlocks) => {
  const newVirtualBlocks = {};

  Object.entries(oldVirtualBlocks).forEach(([location, item]) => {
    // Check if this is legacy structure (has id and label)
    if (item.id && item.label) {
      // Old structure detected - convert to new format
      newVirtualBlocks[location] = {
        contents: [
          {
            type: item.contentType || inferContentType(item),
            iconLocation: location,
            contentType: item.label,
            contentValue: item.id,
          },
        ],
      };
    } else if (item.contents && Array.isArray(item.contents)) {
      // Already new structure - keep as is
      newVirtualBlocks[location] = item;
    } else {
      // Empty or invalid - initialize with empty array
      newVirtualBlocks[location] = { contents: [] };
    }
  });

  return newVirtualBlocks;
};

/**
 * Parse virtual blocks from pages with new structure
 * Supports both new multi-item format and legacy single-item format
 * @param {Array} pages - Array of page objects with v_blocks
 * @returns {Array} - Array of virtualBlocks objects, one per page
 */
export const parseVirtualBlocksFromPages = (pages) => {
  const virtualBlocksPages = pages?.map((page) => {
    const vBlocks = { ...VIRTUAL_BLOCKS };

    // Check if page has v_blocks
    if (!page.v_blocks || page.v_blocks.length === 0) {
      return vBlocks;
    }

    page.v_blocks.forEach((v_block) => {
      // New format: v_block has contents array
      if (v_block.contents && Array.isArray(v_block.contents)) {
        // Group contents by iconLocation
        const contentsByLocation = {};

        v_block.contents.forEach((content) => {
          const location = content.iconLocation;
          if (!contentsByLocation[location]) {
            contentsByLocation[location] = [];
          }

          const parsedItem = {
            type: content.type || inferContentType(content),
            iconLocation: location,
            contentType: content.contentType,
            contentValue: content.contentValue,
          };
          if (content.type === "autogen") {
            parsedItem.jobId = content.jobId || null;
            parsedItem.status = content.status || "pending";
            parsedItem.objectId = content.objectId || null;
            parsedItem.errorMessage = content.errorMessage || null;
            parsedItem.cropRect = content.cropRect || null;
          }
          contentsByLocation[location].push(parsedItem);
        });

        // Assign grouped contents to locations
        Object.entries(contentsByLocation).forEach(([location, contents]) => {
          vBlocks[location] = { contents };
        });
      } else {
        // Legacy format: v_block is a single item
        const iconLocation = v_block.iconLocation;
        if (iconLocation && v_block.contentValue && v_block.contentType) {
          vBlocks[iconLocation] = {
            contents: [
              {
                type: inferContentType(v_block),
                iconLocation: iconLocation,
                contentType: v_block.contentType,
                contentValue: v_block.contentValue,
              },
            ],
          };
        }
      }
    });

    return vBlocks;
  });

  return virtualBlocksPages;
};

/**
 * Parse virtual blocks from active page with new structure
 * Supports both new multi-item format and legacy single-item format
 * @param {Object} page - Page object with v_blocks
 * @returns {Object} - VirtualBlocks object with contents arrays
 */
export const parseVirtualBlocksFromActivePage = (page) => {
  const vBlocks = { ...VIRTUAL_BLOCKS };

  // Check if page has v_blocks
  if (!page?.v_blocks || page.v_blocks.length === 0) {
    return vBlocks;
  }

  page.v_blocks.forEach((v_block) => {
    // New format: v_block has contents array
    if (v_block.contents && Array.isArray(v_block.contents)) {
      // Group contents by iconLocation
      const contentsByLocation = {};

      v_block.contents.forEach((content) => {
        const location = content.iconLocation;
        if (!contentsByLocation[location]) {
          contentsByLocation[location] = [];
        }

        const parsedItem = {
          type: content.type || inferContentType(content),
          iconLocation: location,
          contentType: content.contentType,
          contentValue: content.contentValue,
        };
        if (content.type === "autogen") {
          parsedItem.jobId = content.jobId || null;
          parsedItem.status = content.status || "pending";
          parsedItem.objectId = content.objectId || null;
          parsedItem.errorMessage = content.errorMessage || null;
          parsedItem.cropRect = content.cropRect || null;
        }
        contentsByLocation[location].push(parsedItem);
      });

      // Assign grouped contents to locations
      Object.entries(contentsByLocation).forEach(([location, contents]) => {
        vBlocks[location] = { contents };
      });
    } else {
      // Legacy format: v_block is a single item
      const iconLocation = v_block.iconLocation;
      if (iconLocation && v_block.contentValue && v_block.contentType) {
        vBlocks[iconLocation] = {
          contents: [
            {
              type: inferContentType(v_block),
              iconLocation: iconLocation,
              contentType: v_block.contentType,
              contentValue: v_block.contentValue,
            },
          ],
        };
      }
    }
  });

  return vBlocks;
};
