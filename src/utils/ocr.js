import { hexToRgbA } from "./helper";

export const onEditTextField = (results, id, text) => {
  const newExtractedTextList = results.map((item) => {
    if (item.id === id) {
      item.text = text;
    }
    return item;
  });
  return newExtractedTextList;
};

export function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

export const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export const getTypeOfParameter = (types, type, parameter) => {
  const selectedType = types.find((_type) => _type.typeName === type);
  const labels = selectedType.labels;
  const item = labels.find((label) => {
    const keys = Object.keys(label);
    const key = keys[0];
    return key === parameter;
  });
  const values = Object.values(item);
  return values[0];
};

export const constructBoxColors = (trialAreas) => {
  const values = trialAreas.map((_, idx) => `& > div:nth-of-type(${idx + 2})`);

  const obj = trialAreas.map((trialArea, idx) => {
    if (values[idx]) {
      return {
        [values[idx]]: {
          border: `2px solid ${trialArea.color} !important`,
          backgroundColor: `${hexToRgbA(trialArea.color)}`,
        },
      };
    } else {
      return {};
    }
  });

  return obj;
};
