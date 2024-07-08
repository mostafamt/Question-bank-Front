import * as yup from "yup";
import Text from "../components/DrawnUI/Text/Text";
import Image from "../components/DrawnUI/Image/Image";
import Video from "../components/DrawnUI/Video/Video";
import Sound from "../components/DrawnUI/Sound/Sound";
import Boolean from "../components/DrawnUI/Boolean/Boolean";
import { trimText } from "./data";

export const AUTO_UI_TYPES_MAPPING = {
  text: <Text />,
  number: <Text />,
  color: <Text />,
  image: <Image />,
  video: <Video />,
  voice: <Sound />,
  Bool: <Boolean />,
  timeStamp: <Text />,
  Coordinate: <Text type="number" />,
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
    if (key.includes(label) && key.includes("*")) {
      required = true;
    }
  });
  return required;
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
