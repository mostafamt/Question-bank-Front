import React from "react";
import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import { getTypeOfKey, searchIfHintExist } from "../../../utils/auto-ui";
import { ignoreSpaces } from "../../../utils/data";

import styles from "./oneOfUI.module.scss";

const OneOfUI = ({
  fields,
  labels,
  space,
  level,
  index,
  arrayName,
  setValue,
  getValues,
  renderSingleField,
}) => {
  const getInitialKey = () => {
    for (const { key } of fields) {
      const name = level === 1 ? key : `${arrayName}.${index}.${key}`;
      const val = getValues(name);
      if (val) return key;
    }
    return fields[0].key;
  };

  const [selectedKey, setSelectedKey] = React.useState(getInitialKey);

  const onRadioChange = (e) => {
    const newKey = e.target.value;
    const prevName = level === 1 ? selectedKey : `${arrayName}.${index}.${selectedKey}`;
    setValue(prevName, "");
    setSelectedKey(newKey);
  };

  const activeField = fields.find((f) => f.key === selectedKey);

  return (
    <Box className={styles["one-of-ui"]}>
      <RadioGroup row value={selectedKey} onChange={onRadioChange}>
        {fields.map(({ key }) => (
          <FormControlLabel
            key={key}
            value={key}
            control={<Radio size="small" />}
            label={key}
          />
        ))}
      </RadioGroup>
      <Box className={styles["active-field"]}>
        {renderSingleField(activeField.key, activeField.value, space, level, index, arrayName)}
      </Box>
    </Box>
  );
};

export default OneOfUI;
