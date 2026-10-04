import React from "react";
import { Box, IconButton, List } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import styles from "./arrayUI.module.scss";
import { useFieldArray } from "react-hook-form";
import ValidationMessage from "../../ValidationMessage/ValidationMessage";
import { fullTextTrim } from "../../../utils/data";
import ArrayItem from "./ArrayItem/ArrayItem";

const ArrayUI = (props) => {
  const {
    space,
    label,
    control,
    object,
    errors,
    path,
  } = props;

  const { fields, append, remove } = useFieldArray({
    name: label,
    control,
  });

  const [open, setOpen] = React.useState(Array(fields.length).fill(false));

  const AddButton = () => {
    return (
      <div>
        <IconButton
          aria-label="add"
          onClick={() => append(object)}
          color="primary"
        >
          <AddIcon />
        </IconButton>
      </div>
    );
  };

  const onClickItem = (idx) => {
    setOpen((prevState) => {
      const newState = [...prevState];
      newState[idx] = !newState[idx];
      return newState;
    });
  };

  const items = (
    <List>
      {fields.map((field, index) => (
        <div key={field.id}>
          <ArrayItem
            open={open[index]}
            onClickItem={() => onClickItem(index)}
            remove={() => remove(index)}
            label={label}
            {...props}
            index={index}
          />
        </div>
      ))}
      <AddButton />
    </List>
  );


  return (
    <Box sx={{ mb: space }}>
      <h5>{fullTextTrim(label)}: </h5>

      <div className={styles.item}>{items}</div>
      <ValidationMessage errors={errors} path={path} />
    </Box>
  );
};

export default ArrayUI;
