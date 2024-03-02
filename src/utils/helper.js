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

function getSet2FromSet1(set1) {
  let res = "";
  if (set1 === "en") {
    res = "eng";
  } else if (set1 === "ar") {
    res = "ara";
  }
  return res;
}

export { constructMCQParametersFromKeyValuePairs, hexToRgbA, getSet2FromSet1 };
