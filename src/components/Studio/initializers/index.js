import { v4 as uuidv4 } from "uuid";
import { colors } from "../../../constants/highlight-color";
import { COMPOSITE_BLOCK } from "../constants";
import { getTypeNameOfLabelKey, getTypeOfLabel } from "../../../utils/ocr";

// Some server blocks (e.g. "Section") come without a blockId. They still need
// a unique id for id-based lookups (updateAreaPropertyById, delete). It's built
// from page + position so initAreas and initAreasProperties agree on it, and it
// never reaches the server: submit sends `blockId`, which stays undefined.
const getLocalBlockId = (block, page, pageIdx, idx) =>
  block.blockId ?? `local-${page._id ?? pageIdx}-${idx}`;

// --- Initialize Areas (the visual selection rectangles) ---
export const initAreas = (pages = []) => {
  return pages.map((page, pageIdx) =>
    (page.blocks || []).map((block, idx) => ({
      id: getLocalBlockId(block, page, pageIdx, idx),
      x: block.coordinates.x,
      y: block.coordinates.y,
      width: block.coordinates.width,
      height: block.coordinates.height,
      unit: "px",
      isChanging: true,
      isNew: true,
      _unit: block.coordinates.unit,
      _updated: false,
      name: block.objectName,
    }))
  );
};

// --- Initialize Area Properties (text, label, color, ocr metadata) ---
export const initAreasProperties = (pages = [], types = []) => {
  return pages.map((page, pageIdx) =>
    (page.blocks || []).map((block, idx) => {
      const typeName = getTypeNameOfLabelKey(types, block.contentType);

      return {
        x: block.coordinates.x,
        y: block.coordinates.y,
        width: block.coordinates.width,
        height: block.coordinates.height,
        id: getLocalBlockId(block, page, pageIdx, idx),
        color: colors[idx % colors.length],
        loading: false,
        text: block.contentValue,
        image: block.contentValue,
        audio: block.contentValue,
        video: block.contentValue,
        type: typeName,
        parameter: "",
        label: block.contentType,
        typeOfLabel: getTypeOfLabel(types, typeName, block.contentType),
        order: idx,
        open: false,
        isServer: "true",
        isDeep: block.isDeep === true,
        blockId: block.blockId,
        name: block.objectName,
      };
    })
  );
};

export const initCompositeBlocks = () => {
  return {
    name: `${COMPOSITE_BLOCK.NAME_PREFIX} ${uuidv4().slice(
      0,
      COMPOSITE_BLOCK.UUID_SLICE_LENGTH
    )}`,
    type: "",
    areas: [],
  };
};

