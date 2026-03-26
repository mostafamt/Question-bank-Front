import * as yup from "yup";
import Text from "../components/DrawnUI/Text/Text";
import Image from "../components/DrawnUI/Image/Image";
import Video from "../components/DrawnUI/Video/Video";
import Sound from "../components/DrawnUI/Sound/Sound";
import Boolean from "../components/DrawnUI/Boolean/Boolean";
import QuillInput from "../components/DrawnUI/QuillInput/QuillInput";
import InteractiveObject from "../components/DrawnUI/InteractiveObject/InteractiveObject";
import XObjectUI from "../components/DrawnUI/XObjectUI/XObjectUI";
import { trimText } from "./data";

export const AUTO_UI_TYPES_MAPPING = {
  text: <Text />,
  number: <Text />,
  color: <Text />,
  image: <Image />,
  video: <Video />,
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

export const getSchema = (abstractParameters, labels, level = 1) => {
  let object = {};

  for (let [key, value] of Object.entries(abstractParameters)) {
    const type = getTypeOfKey(labels, key) || value;
    const required = searchIfRequired(labels, key);

    // const atLeastOneCorrect = searchIfAtLeastOneCorrect(labels, key);

    if (required) {
      object = {
        ...object,
        [key]: yup.string().required(),
      };
    } else if (Array.isArray(type)) {
      const minimumLength = searchIfHasMinimumLength(key);
      const innerSchema = getSchema(value?.[0], labels, level + 1);
      object = {
        ...object,
        [key]: yup.array().min(minimumLength).of(innerSchema),
        //   .test(
        //     "at-least-one-correct",
        //     "At least one option must be correct",
        //     function (data) {
        //       return data?.some((answer) => answer._Correct_ === true);
        //     }
        //   ),
      };
    }
  }

  const schema = yup.object({
    ...object,
  });

  return schema;
};
