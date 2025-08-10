import { v4 as uuidv4 } from "uuid";

const addPropsToAreasForCompositeBlocks = (compositeBlocks, areasParam) => {
  const newAreas = areasParam.map((item) => {
    if (!item.id) {
      item = { ...item, id: uuidv4(), type: "" };
    }
    return item;
  });
  return { ...compositeBlocks, areas: newAreas };
};

const getList1FromData = (data) => {
  const list = data?.labels?.map((item) => item.typeName);
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

export {
  addPropsToAreasForCompositeBlocks,
  getList1FromData,
  getList2FromData,
};
