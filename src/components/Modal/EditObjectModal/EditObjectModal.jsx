import React from "react";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { useStore } from "../../../store/store";
import { v4 as uuidv4 } from "uuid";

import styles from "./editObjectModal.module.scss";
import { getAllTypes, getCategories } from "../../../services/api";
import { useQuery } from "@tanstack/react-query";
import Input from "../../Input/Input";
import { useForm } from "react-hook-form";
import { getBaseTypeFromType } from "../../../utils/helper";

const EditObjectModal = (props) => {
  const {
    handleClose,
    subObject,
    name: questionName,
    type: questionType,
  } = props;
  const { data: state, setFormState } = useStore();
  const [name, setName] = React.useState(state?.questionName);
  const [category, setCategory] = React.useState(state?.category);
  const [type, setType] = React.useState(state?.higherType);

  const { data: categories, isFetching: isFetchingCategories } = useQuery({
    queryKey: [`categories`],
    queryFn: getCategories,
    refetchOnWindowFocus: false,
  });

  const onChangeName = (event) => {
    setName(event.target.value);
  };

  const onChangeCategory = (event) => {
    setCategory(event.target.value);
  };

  const onChangeType = (event) => {
    setType(event.target.value);
  };

  const onSubmit = (event) => {
    event.preventDefault();
    const name = event.target["name"].value;
    const category = event.target["category"].value;
    const type = event.target["type"].value;
    const baseType = getBaseTypeFromType(categories, category, type);
    setFormState({
      ...state,
      questionName: name,
      category,
      higherType: type,
      type: baseType,
    });
    handleClose();
  };

  let labels = [];
  if (categories) {
    const selectedCategory = categories.find(
      (cat) => cat.typeName === category
    );
    labels = selectedCategory?.labels;
  }

  return (
    <div className={styles["modal-content"]}>
      <div className={styles.header}>
        <p>Edit Object</p>
        <IconButton aria-label="close" onClick={handleClose}>
          <ClearIcon />
        </IconButton>
      </div>

      <form className={styles.actions} onSubmit={onSubmit}>
        <TextField
          id="outlined-basic"
          label="Name"
          variant="outlined"
          name="name"
          value={name}
          onChange={onChangeName}
        />

        {isFetchingCategories ? (
          <p>Loading...</p>
        ) : (
          <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Category</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                label="Category"
                name="category"
                value={category}
                onChange={onChangeCategory}
              >
                {categories?.map((category) => (
                  <MenuItem key={category.typeName} value={category.typeName}>
                    {category.typeName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        {/* <input
          onClick={() => {
            reset({
              name: `some name ${uuidv4()}`,
              category: "Question",
            });
          }}
          value="reset"
        /> */}

        {labels ? (
          <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Type</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                label="Type"
                name="type"
                value={type}
                onChange={onChangeType}
              >
                {labels?.map((item, idx) => (
                  <MenuItem key={idx} value={Object.keys(item)?.[0]}>
                    {Object.keys(item)?.[0]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        ) : (
          <p>Loading</p>
        )}

        <div className={styles.submit}>
          <Button variant="contained" type="submit">
            submit
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditObjectModal;
