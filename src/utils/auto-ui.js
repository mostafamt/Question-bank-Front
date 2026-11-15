import * as yup from "yup";
import Text from "../components/DrawnUI/Text/Text";
import Image from "../components/DrawnUI/Image/Image";
import Video from "../components/DrawnUI/Video/Video";
import Pdf from "../components/DrawnUI/Pdf/Pdf";
import Html from "../components/DrawnUI/Html/Html";
import Sound from "../components/DrawnUI/Sound/Sound";
import Boolean from "../components/DrawnUI/Boolean/Boolean";
import QuillInput from "../components/DrawnUI/QuillInput/QuillInput";
import InteractiveObject from "../components/DrawnUI/InteractiveObject/InteractiveObject";
import XObjectUI from "../components/DrawnUI/XObjectUI/XObjectUI";
import { fullTextTrim, ignoreSpaces, trimText } from "./data";

export const AUTO_UI_TYPES_MAPPING = {
  text: <Text />,
  number: <Text />,
  color: <Text />,
  image: <Image />,
  video: <Video />,
  pdf: <Pdf />,
  ppt: <Pdf kind="ppt" />,
  html: <Html />,
  voice: <Sound />,
  audio: <Sound />,
  Bool: <Boolean />,
  timeStamp: <Text />,
  Coordinate: <Text type="number" />,
  QuillInput: <QuillInput />,
  SI: <InteractiveObject />,
  XObject: <XObjectUI />,
};

export const getTypeOfKey = (labels, type) => {
  const item = labels.find((label) => {
    const key = Object.keys(label)?.[0];
    const trimmedKey = trimText(key);

    return trimmedKey === type;
  });

  return item ? Object.values(item)[0] : null;
};

export const searchIfRequired = (labels, label) => {
  let required = false;
  labels.forEach((item) => {
    const key = Object.keys(item)?.[0];
    const trimmedKey = trimText(key);
    if (trimmedKey === label && key.includes("*")) {
      required = true;
    }
  });
  return required;
};

export const searchIfOneOf = (labels, key) => {
  return labels.some((item) => {
    const labelKey = Object.keys(item)[0];
    return trimText(labelKey) === key && labelKey.startsWith("?");
  });
};

export const groupOneOfFields = (abstractParameters, labels) => {
  const entries = Object.entries(abstractParameters);
  const groups = [];
  let currentOneOfGroup = null;

  for (const [key, value] of entries) {
    if (searchIfOneOf(labels, key)) {
      if (!currentOneOfGroup) {
        currentOneOfGroup = { oneOf: true, fields: [] };
        groups.push(currentOneOfGroup);
      }
      currentOneOfGroup.fields.push({ key, value });
    } else {
      currentOneOfGroup = null;
      groups.push({ oneOf: false, key, value });
    }
  }

  return groups;
};

export const searchIfHintExist = (hints, label) => {
  let hint = "";
  hints?.forEach((item) => {
    const key = Object.keys(item)?.[0];
    const trimmedKey = trimText(key);
    if (trimmedKey === label) {
      hint = item[key];
    }
  });
  return hint;
};

const searchIfAtLeastOneCorrect = (labels, label) => {
  return true;
};

const searchIfHasMinimumLength = (label) => {
  const numbers = label.match(/\d+/g);
  return numbers ? parseInt(numbers[0]) : 0;
};

// Same order as DrawnUIForm.renderSingleField, so what is validated is what is shown
export const resolveType = (labels, key, value) =>
  ignoreSpaces(value) || getTypeOfKey(labels ?? [], key);

// Fields whose value is the URL of an uploaded file
const FILE_URL_TYPES = ["image", "video", "audio", "voice", "html"];

const isEmptyValue = (value) => {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  // pdf / ppt fields hold { url, pages }
  if (typeof value === "object" && "url" in value) {
    return isEmptyValue(value.url) && !value.pages?.length;
  }
  return false;
};

// Quill keeps "<p><br></p>" for an empty editor
const isEmptyRichText = (value) =>
  isEmptyValue(value) ||
  (typeof value === "string" && value.replace(/<[^>]*>/g, "").trim() === "");

const isHttpUrl = (value) => {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
};

// Leaf fields use mixed() so validating never changes the submitted values
const fieldSchema = (key, type, required, labels, level) => {
  const label = fullTextTrim(key);
  const requiredMessage = `${label} is required`;

  if (Array.isArray(type)) {
    const minimumLength = Math.max(
      searchIfHasMinimumLength(key),
      required ? 1 : 0
    );
    return yup
      .array()
      .typeError(`${label} must be a list`)
      .min(
        minimumLength,
        `${label} needs at least ${minimumLength} item${
          minimumLength > 1 ? "s" : ""
        }`
      )
      .of(getSchema(type[0], labels, level + 1));
  }

  // ObjectUI can't edit nested fields yet, so they aren't validated
  if (typeof type === "object") return yup.mixed();

  if (type === "pdf" || type === "ppt") {
    const kindLabel = type === "ppt" ? "PowerPoint" : "PDF";
    let schema = yup
      .mixed()
      .test(
        "url",
        `${kindLabel} link must be a valid http(s) URL`,
        (data) => isEmptyValue(data?.url) || isHttpUrl(data.url)
      );
    if (required) {
      schema = schema.test(
        "has-pages",
        `${kindLabel} is required`,
        (data) => data?.pages?.length > 0
      );
    }
    return schema;
  }

  if (type === "Bool") {
    // Unchecked is a valid answer, so a checkbox is never "missing"
    return yup.mixed();
  }

  let schema = yup.mixed();

  if (FILE_URL_TYPES.includes(type)) {
    schema = schema.test(
      "url",
      `${label} must be a valid http(s) URL`,
      (data) =>
        isEmptyValue(data) || (typeof data === "string" && isHttpUrl(data.trim()))
    );
  } else if (type === "number" || type === "Coordinate") {
    schema = schema.test(
      "number",
      `${label} must be a number`,
      (data) => isEmptyValue(data) || !Number.isNaN(Number(data))
    );
  }

  if (required) {
    const isEmpty = type === "QuillInput" ? isEmptyRichText : isEmptyValue;
    schema = schema.test("required", requiredMessage, (data) => !isEmpty(data));
  }

  return schema;
};

export const getSchema = (abstractParameters, labels, level = 1) => {
  labels = labels ?? [];
  const object = {};
  const requiredOneOfGroups = [];

  for (const group of groupOneOfFields(abstractParameters ?? {}, labels)) {
    const fields = group.oneOf ? group.fields : [group];

    for (const { key, value } of fields) {
      const type = resolveType(labels, key, value);
      if (!type) continue;
      // A one-of field is hidden when another option is picked, so the group
      // as a whole is required instead of each field
      const required = !group.oneOf && searchIfRequired(labels, key);
      object[key] = fieldSchema(key, type, required, labels, level);
    }

    if (group.oneOf && fields.some(({ key }) => searchIfRequired(labels, key))) {
      requiredOneOfGroups.push(fields.map(({ key }) => key));
    }
  }

  let schema = yup.object(object);

  requiredOneOfGroups.forEach((keys, index) => {
    const message = `Fill one of: ${keys.map(fullTextTrim).join(", ")}`;
    schema = schema.test(`one-of-${index}`, message, function (values) {
      if (keys.some((key) => !isEmptyValue(values?.[key]))) return true;
      // Only the picked option is on screen, so put the message on every option
      return new yup.ValidationError(
        keys.map((key) =>
          this.createError({
            path: this.path ? `${this.path}.${key}` : key,
            message,
          })
        )
      );
    });
  });

  return schema;
};
