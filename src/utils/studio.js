import { v4 as uuidv4 } from "uuid";
import { colors } from "../constants/highlight-color";

const getList1FromData = (data) => {
  if (!data || !data.labels) {
    return [];
  }
  const list = data.labels.map((item) => item.typeName);
  return list;
};

const getList2FromData = (data, selectedItem) => {
  if (!data || !selectedItem) {
    return [];
  }
  const labels = data?.labels?.find(
    (item) => item.typeName === selectedItem
  )?.labels;
  const objects = labels?.reduce((acc, cur) => ({ ...acc, ...cur }), {});
  const list = Object?.keys(objects).map((key) => key.replace(/^\?/, ""));
  return list;
};

const addPropsToAreasForCompositeBlocks = (compositeBlocks, areasParam) => {
  const existingAreas = compositeBlocks.areas || [];
  const newAreas = areasParam.map((item, idx) => {
    const existing = existingAreas[idx];
    if (!item.id && existing) {
      // Existing area — merge library coordinates with our custom properties
      return {
        ...existing,
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height,
        unit: item.unit,
      };
    }
    if (!item.id) {
      // New area — assign id and defaults
      return {
        ...item,
        id: uuidv4(),
        type: "",
        open: true,
      };
    }
    return item;
  });
  return { ...compositeBlocks, areas: newAreas };
};

const getTypeOfLabelForCompositeBlocks = (data, type1, type2) => {
  let type = "";
  data?.labels?.forEach((element) => {
    if (element.typeName === type1) {
      element?.labels?.forEach((el) => {
        let key = Object.keys(el)?.[0].replace(/^\?/, "");
        let value = Object.values(el)?.[0];
        if (key === type2) {
          type = value;
        }
      });
    }
  });
  return type;
};

// Maps an area's display type to the internal label types used in composite block definitions
const AREA_TYPE_TO_INTERNAL = {
  "Question": ["QObject"],
  "Illustrative object": ["Object", "XObject"],
};

/**
 * Given a composite block typeName and an area's display type (e.g. "Question"),
 * returns the matching label name (without "?" prefix) from the type's labels.
 */
const getLabelForAreaType = (data, typeName, areaType) => {
  const allowedInternalTypes = AREA_TYPE_TO_INTERNAL[areaType] || [];
  const labels = data?.labels?.find((item) => item.typeName === typeName)?.labels;
  if (!labels) return "";

  for (const labelObj of labels) {
    const key = Object.keys(labelObj)[0];
    const value = Object.values(labelObj)[0];
    if (allowedInternalTypes.includes(value)) {
      return key.replace(/^\?/, "");
    }
  }
  return "";
};

export {
  getList1FromData,
  getList2FromData,
  addPropsToAreasForCompositeBlocks,
  getTypeOfLabelForCompositeBlocks,
  getLabelForAreaType,
};
