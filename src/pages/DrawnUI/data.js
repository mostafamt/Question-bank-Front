import { trimText } from "../../utils/data";

export const getTypeOfKey = (labels, type) => {
  const item = labels.find((label) => {
    const key = Object.keys(label)?.[0];
    const trimmedKey = trimText(key);

    return trimmedKey === type;
  });

  return item ? Object.values(item)[0] : null;
};
