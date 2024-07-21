const BOOLEAN = "Bool";

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

export const trimText = (text) =>
  text.replaceAll("\n", "").replaceAll("*", "").replaceAll("#", "");

export const fullTextTrim = (text) => trimText(text).replaceAll("_", "");

export { emptyValues, fillValues, syntaxHighlight };
