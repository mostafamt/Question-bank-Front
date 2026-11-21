import { v4 as uuidv4 } from "uuid";

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

// Maps an area's display type (the block-category typeName from
// interactive-object-types) to the internal label types used in composite
// block definitions. "Question" / "Illustrative object" are the legacy names.
const AREA_TYPE_TO_INTERNAL = {
  "Question": ["QObject"],
  "Questions": ["QObject"],
  "Illustrative object": ["Object", "XObject"],
  "Explanations": ["Object", "XObject"],
  "Smart Objects": ["Object", "XObject"],
  "Simulations": ["Object", "XObject"],
};

/**
 * Area display types that can be picked into the given composite block type,
 * based on the internal types (QObject, Object, XObject) of its labels.
 * With no composite type chosen, every object-holding area type is allowed.
 */
const getAllowedAreaTypes = (data, typeName) => {
  const allTypes = Object.keys(AREA_TYPE_TO_INTERNAL);
  const labels = data?.labels?.find((item) => item.typeName === typeName)?.labels;
  if (!labels) return allTypes;

  const internalTypes = new Set(labels.map((labelObj) => Object.values(labelObj)[0]));
  const allowed = allTypes.filter((areaType) =>
    AREA_TYPE_TO_INTERNAL[areaType].some((t) => internalTypes.has(t))
  );
  return allowed.length > 0 ? allowed : allTypes;
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
  getAllowedAreaTypes,
};
