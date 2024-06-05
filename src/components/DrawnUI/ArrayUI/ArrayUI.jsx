import React from "react";
import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import styles from "./arrayUI.module.scss";
import { useFieldArray } from "react-hook-form";

const ArrayUI = (props) => {
  const { value, parseParameters, space, level, label, control, object } =
    props;

  const { fields, append, remove } = useFieldArray({
    name: label,
    control,
  });

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

  const RemoveButton = (props) => {
    const { index } = props;
    return (
      <div className={styles["remove-box"]}>
        <IconButton
          aria-label="delete"
          onClick={() => remove(index)}
          color="error"
        >
          <DeleteIcon />
        </IconButton>
      </div>
    );
  };

  const item = fields.map((field, outterIndex) => (
    <div key={field.id}>
      {value.map((itm, innerIndex) => (
        <div key={innerIndex} className={styles["array-item"]}>
          <RemoveButton id={itm.key} index={outterIndex} />
          <div className={styles.array}>
            {parseParameters(itm, space - 2, level + 1, outterIndex, label)}
          </div>
        </div>
      ))}
    </div>
  ));

  return (
    <>
      <h5>{label}: </h5>

      <div className={styles.item}>
        {item}
        <AddButton />
      </div>
    </>
  );
};

export default ArrayUI;
