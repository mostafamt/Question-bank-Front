import { v4 as uuidv4 } from "uuid";

const constructMCQParametersFromKeyValuePairs = (keyValuePairs) => {
  return {
    title: keyValuePairs.find((item) => item?.parameter === "question")?.text,
    options: keyValuePairs
      .filter((item) => item.parameter === "option")
      .map((item) => ({
        id: uuidv4(),
        title: item.text,
        correct: false,
        tip: "",
        showTip: false,
      })),
  };
};

function hexToRgbA(hex) {
  var c;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split("");
    if (c.length == 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = "0x" + c.join("");
    return (
      "rgba(" + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(",") + ", 0.2)"
    );
  }
  // throw new Error("Bad Hex");
}

const getBaseTypeFromType = (categories, categoryName, type) => {
  let baseType = "";
  if (categories) {
    const category = categories.find((item) => item.typeName === categoryName);
    const selectedObj = category?.labels?.find((item) => {
      const [key, _] = Object.entries(item)?.[0];
      return key === type;
    });
    if (selectedObj) {
      const [_, value] = Object.entries(selectedObj)?.[0];
      baseType = value;
    }
  }
  return baseType;
};

const instructionalRoles = [
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

export {
  constructMCQParametersFromKeyValuePairs,
  hexToRgbA,
  getBaseTypeFromType,
  instructionalRoles,
};
