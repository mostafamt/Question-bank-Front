import Tesseract from "tesseract.js";
import { hexToRgbA } from "./helper";
import { trimText } from "./data";
import { useStore } from "../store/store";
import { v4 as uuidv4 } from "uuid";

export const ocr = async (language = "eng", dataUrl) => {
  let text = "";
  try {
    const result = await Tesseract.recognize(dataUrl, language);
    text = result.data.text;
  } catch (err) {
    console.error(err);
  }
  return trimText(text);
};

export const onEditTextField = (areasProperties, activePage, id, text) => {
  const newAreasProperties = [...areasProperties];
  newAreasProperties[activePage] = newAreasProperties[activePage].map(
    (item) => {
      if (item.id === id) {
        item.text = text;
        if (item.status !== CREATED) {
          item.status = UPDATED;
        }
      }
      return item;
    }
  );
  return newAreasProperties;
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
  const selectedType = types.find((_type) => _type.typeName === type.typeName);
  const labels = selectedType.labels;
  const item = labels.find((label) => {
    const keys = Object.keys(label);
    const key = keys[0];
    return key === parameter;
  });
  const values = Object.values(item);
  return values[0];
};

export const getTypeOfLabel = (types, type, label) => {
  let filteredTypes = types.filter((item) => item.typeCategory === "B");

  const selectedType = filteredTypes.find((item) =>
    compareStringsIgnoreSpaces(item.typeName, type)
  );
  if (!selectedType) {
    return "";
  }
  const labels = selectedType.labels;

  const selectedLabel = labels.find((item) => Object.keys(item)[0] === label);
  return Object.values(selectedLabel)[0];
};

export const getTypeOfLabel2 = (types, type, label) => {
  const selectedType = types.find((item) =>
    compareStringsIgnoreSpaces(item.typeName, type)
  );
  const labels = selectedType.labels;

  const selectedLabel = labels.find((item) => Object.keys(item)[0] === label);
  return Object.values(selectedLabel)[0];
};

export const constructBoxColors = (trialAreas) => {
  const values = trialAreas?.map((_, idx) => `& > div:nth-of-type(${idx + 2})`);

  const obj = trialAreas?.map((trialArea, idx) => {
    if (values[idx]) {
      if (trialArea.status === DELETED) {
        return {
          [values[idx]]: {
            border: `2px solid #000 !important`,
            backgroundColor: `rgba(0, 0, 0, 0.5)`,
          },
        };
      } else {
        return {
          [values[idx]]: {
            border: `2px solid ${trialArea.color} !important`,
            backgroundColor: `${hexToRgbA(trialArea.color)}`,
          },
        };
      }
    } else {
      return {};
    }
  });

  return { "& > div": obj };
};

export const cropSelectedArea = (canvasRef, imageRef, x, y, width, height) => {
  const canvas = canvasRef.current;
  const image = imageRef.current;

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
  const dataUrl = canvas.toDataURL("image/jpeg");
  return dataUrl;
};

export const deleteAreaByIndex = (areas, activePage, index) => {
  const newAreas = [...areas];
  newAreas[activePage] = newAreas[activePage].filter((_, idx) => idx !== index);
  return newAreas;
};

export const deleteAreaPropertyByIndex = (
  areasProperties,
  activePage,
  index
) => {
  const newAreasProperties = [...areasProperties];
  newAreasProperties[activePage] = newAreasProperties[activePage].filter(
    (_, idx) => idx !== index
  );
  return newAreasProperties;
};

export const extractImage = (
  canvasRef,
  imageRef,
  areasProperties,
  activePage,
  areas,
  id
) => {
  const idx = areasProperties[activePage].findIndex((item) => item.id === id);
  const activeArea = areas[activePage][idx];
  const image = imageRef.current;
  const { clientWidth, clientHeight } = image;
  const ratio = image.naturalWidth / image.width;
  const x = ((activeArea.x * ratio) / 100) * clientWidth;
  const y = ((activeArea.y * ratio) / 100) * clientHeight;
  const width = ((activeArea.width * ratio) / 100) * clientWidth;
  const height = ((activeArea.height * ratio) / 100) * clientHeight;
  const croppedImage = cropSelectedArea(
    canvasRef,
    imageRef,
    x,
    y,
    width,
    height
  );
  return croppedImage;
};

export const updateAreasProperties = (
  areasProperties,
  activePage,
  areas,
  subObject,
  type
) => {
  let newAreas = [];

  for (let block = 0; block < areasProperties[activePage].length; block++) {
    const { isServer, status } = areasProperties[activePage][block];

    newAreas = [
      ...newAreas,
      {
        x: areas[activePage][block].x,
        y: areas[activePage][block].y,
        width: areas[activePage][block].width,
        height: areas[activePage][block].height,
        id: areasProperties[activePage][block].id,
        color: areasProperties[activePage][block].color,
        loading: areasProperties[activePage][block].loading,
        text: areasProperties[activePage][block].text,
        image: areasProperties[activePage][block].image,
        type: areasProperties[activePage][block].type,
        label: areasProperties[activePage][block].label,
        typeOfLabel: areasProperties[activePage][block].typeOfLabel,
        parameter: areasProperties[activePage][block].parameter,
        order: areasProperties[activePage][block].order,
        open: areasProperties[activePage][block].open,
        status: status === DELETED ? status : isServer ? UPDATED : CREATED,
        isServer,
      },
    ];
  }

  if (areas[activePage].length > areasProperties[activePage].length) {
    newAreas = [
      ...newAreas,
      {
        x: areas[areas.length - 1].x,
        y: areas[areas.length - 1].y,
        width: areas[areas.length - 1].width,
        height: areas[areas.length - 1].height,
        id: uuidv4(),
        color: null,
        loading: false,
        text: "",
        image: "",
        type: subObject ? type : "",
        parameter: "",
        label: "",
        typeOfLabel: "",
        order: areas.length - 1,
        open: true,
        status: CREATED,
        isServer: false,
      },
    ];
  }

  const newDrawnAreas = [...areasProperties];
  newDrawnAreas[activePage] = newAreas;

  return newDrawnAreas;
};

export const useTypes = () => {
  const { data: state } = useStore();
  const types = state.types
    ?.filter((item) => item.typeCategory === "B")
    .map((item) => item.typeName);

  return types;
};

function compareStringsIgnoreSpaces(str1, str2) {
  // Remove all spaces from both strings
  // console.log("str1 =", str1);
  // console.log("str2 =", str2);
  const cleanStr1 = str1?.replace(/\s+/g, "");
  const cleanStr2 = str2?.replace(/\s+/g, "");

  // Compare the cleaned strings
  return cleanStr1 === cleanStr2;
}

export const getLabels = (types, typeName) => {
  let labels =
    types?.find((item) => compareStringsIgnoreSpaces(item.typeName, typeName))
      ?.labels || [];
  labels = labels.map((item) => Object.keys(item)?.[0]);

  return labels;
};

export const getTypeNameOfLabelKey = (types, labelKey) => {
  let filteredTypes = types.filter((item) => item.typeCategory === "B");

  let typeName = "";

  filteredTypes.forEach((item) => {
    if (typeName) return;
    const labels = item.labels;
    labels.forEach((it) => {
      const key = Object.keys(it)[0];
      if (compareStringsIgnoreSpaces(key, labelKey)) {
        typeName = item.typeName;
      }
    });
  });

  return typeName;
};

export const getValue = (types, type, label) => {
  console.log("types= ", types);
  console.log("type= ", type);
  let labels =
    types.find((item) => compareStringsIgnoreSpaces(item.typeName, type))
      ?.labels || [];

  let lab = labels.find((item) => Object.keys(item)?.[0] === label);

  return Object.values(lab)[0];
};

export const DELETED = "deleted";
export const UPDATED = "updated";
export const CREATED = "new";

export const instructionalRoles = [
  "introduction",
  "overview",
  "definition",
  "fact",
  "remark",
  "example",
  "explanation",
  "description",
  "illustration",
  "comparison",
  "summary",
  "conclusion",
  "theory",
  "rule",
  "formula",
  "procedure",
  "algorithm",
  "exercises",
  "casestudy",
  "real_world_problem",
  "question",
  "answer_to_question",
  "exam",
  "recall",
  "test",
  "quiz",
  "vocabulary",
  "reading",
  "pre_reading",
  "review",
  "related_topics",
  "identify",
];

export const COMPLEX_TYPES = [
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

export const isComplexType = (type) => {
  let isComplex = COMPLEX_TYPES.includes(type);

  return isComplex;
};
