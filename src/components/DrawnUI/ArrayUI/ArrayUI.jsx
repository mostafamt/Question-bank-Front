import React from "react";
import { Box, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import styles from "./arrayUI.module.scss";
import { useFieldArray } from "react-hook-form";
import ValidationMessage from "../../ValidationMessage/ValidationMessage";

const ArrayUI = (props) => {
  const {
    type,
    parseParameters,
    space,
    level,
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

  const items = (
    <>
      {fields.map((field, outterIndex) => (
        <div key={field.id}>
          <RemoveButton index={outterIndex} />
          <div className={styles.array}>
            {type.map((itm, innerIndex) => (
              <div key={innerIndex} className={styles["array-item"]}>
                {parseParameters(itm, space - 2, level + 1, outterIndex, label)}
              </div>
            ))}
          </div>
        </div>
      ))}
      <AddButton />
    </>
  );

  console.log("errors= ", errors);

  return (
    <Box sx={{ mb: space }}>
      <h5>{label}: </h5>

      <div className={styles.item}>{items}</div>
      <ValidationMessage errors={errors} path={path} />
      {/* {errors && errors.option && (
        <p className={styles.error}>{errors?.option?.root?.message}</p>
      )} */}
    </Box>
  );
};

export default ArrayUI;
