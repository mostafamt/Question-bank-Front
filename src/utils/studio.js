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
  const newAreas = areasParam.map((item, idx) => {
    if (!item.id) {
      item = {
        ...item,
        id: uuidv4(),
        type: "",
        open: true,
        // color: colors[idx % colors.length],
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
