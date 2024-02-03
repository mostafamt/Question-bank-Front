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

export { constructMCQParametersFromKeyValuePairs };
