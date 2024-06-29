import { hexToRgbA } from "./helper";

const BOOLEAN = "Boolean";

const emptyValues = (object) => {
  let newObject = {};
  for (const key in object) {
    const value = object[key];
    if (Array.isArray(value)) {
      const a = value.map((item) => emptyValues(item));
      newObject = { ...newObject, [key]: a };
    } else if (value === BOOLEAN) {
      newObject = { ...newObject, [key]: false };
    } else {
      newObject = { ...newObject, [key]: "" };
    }
  }
  return newObject;
};

const fillValues = (object, values) => {
  let newObject = {};
  for (const key in object) {
    const value = object[key];
    if (Array.isArray(value)) {
      const a = value.map((item) => emptyValues(item));
      newObject = { ...newObject, [key]: a };
    } else if (value === BOOLEAN) {
      newObject = { ...newObject, [key]: false };
    } else {
      newObject = { ...newObject, [key]: "" };
    }
  }
  return newObject;
};

const syntaxHighlight = (json) => {
  if (!json) return ""; //no JSON from response

  json = json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    function (match) {
      var cls = "number";
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "key";
        } else {
          cls = "string";
        }
      } else if (/true|false/.test(match)) {
        cls = "boolean";
      } else if (/null/.test(match)) {
        cls = "null";
      }
      return '<span class="' + cls + '">' + match + "</span>";
    }
  );
};

const getQuestionType = (questionTypes, questionName) => {
  const selectedType = questionTypes.find(
    (item) => item.typeName.toUpperCase() === questionName.toUpperCase()
  );
  return selectedType;
};

const searchIfRequired = (questionType, label) => {
  const labels = questionType?.labels;
  let required = false;
  labels.forEach((item) => {
    const key = Object.keys(item)?.[0];
    if (key.includes(label) && key.includes("*")) {
      required = true;
    }
  });
  return required;
};

const isRequired = (questionTypes, questionName, label) => {
  const questionObject = getQuestionType(questionTypes, questionName);
  const required = searchIfRequired(questionObject, label);
  return required;
};

const constructBoxColors = (boxColors) => {
  const values = boxColors.map((_, idx) => `& > div:nth-of-type(${idx + 2})`);

  const obj = boxColors.map((color, idx) => {
    if (values[idx]) {
      return {
        [values[idx]]: {
          border: `2px solid ${color} !important`,
          backgroundColor: `${hexToRgbA(color)}`,
        },
      };
    } else {
      return {};
    }
  });

  return obj;
};

export const trimText = (text) => text.replaceAll("\n", "").replaceAll("*", "");

export {
  emptyValues,
  fillValues,
  syntaxHighlight,
  constructBoxColors,
  isRequired,
};
