import Tesseract from "tesseract.js";
import { hexToRgbA } from "./helper";
import { trimText } from "./data";

const getLanguageCodeSet2FromSet1 = (set1) => {
  let res = "";
  if (set1 === "en") {
    res = "eng";
  } else if (set1 === "ar") {
    res = "ara";
  }
  return res;
};

export const ocr = async (language = ENGLISH, dataUrl) => {
  let text = "";
  try {
    const result = await Tesseract.recognize(dataUrl, language);
    text = result.data.text;
  } catch (err) {
    console.error(err);
  }
  return trimText(text);
};

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

export const getSimpleTypes = () => [
  "Text MCQ",
  "Mark The Words",
  "Text Drag Words",
  "Image Juxtaposition",
  "Image MCQ",
  "Fill The Blanks",
  "Dictation",
  "Sort Paragraphs",
  "Image Blinder (Agamotto)",
  "Accordion",
  "Image Pairing",
  "Image Multiple Hotspot Question",
  "Essay",
  "Sort Images",
  "Dialog Cards",
  "Flash Cards",
  "Hotspot Image",
  "Interactive Video",
  "Image Slider",
  "Guess Answer",
  "Chart",
  "TrueFalse",
];

export const ARABIC = "ara";
export const ENGLISH = "eng";
