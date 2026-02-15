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
  const list = Object?.keys(objects);
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
        let key = Object.keys(el)?.[0];
        let value = Object.values(el)?.[0];
        if (key === type2) {
          type = value;
        }
      });
    }
  });
  return type;
};

export {
  getList1FromData,
  getList2FromData,
  addPropsToAreasForCompositeBlocks,
  getTypeOfLabelForCompositeBlocks,
};
