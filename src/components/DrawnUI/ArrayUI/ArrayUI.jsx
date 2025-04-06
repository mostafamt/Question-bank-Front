import React from "react";
import { Box, IconButton, List } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import ListSubheader from "@mui/material/ListSubheader";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import DraftsIcon from "@mui/icons-material/Drafts";
import SendIcon from "@mui/icons-material/Send";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import StarBorder from "@mui/icons-material/StarBorder";

import styles from "./arrayUI.module.scss";
import { useFieldArray } from "react-hook-form";
import ValidationMessage from "../../ValidationMessage/ValidationMessage";
import { fullTextTrim } from "../../../utils/data";
import ArrayItem from "./ArrayItem/ArrayItem";

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

  const [open, setOpen] = React.useState(Array(fields.length).fill(false));

  const AddButton = () => {
    const onClickAddItem = () => {
      append(object);
      openItem(fields.length);
    };

    return (
      <div>
        <IconButton aria-label="add" onClick={onClickAddItem} color="primary">
          <AddIcon />
        </IconButton>
      </div>
    );
  };

  const openItem = (idx) => {
    setOpen((prevState) => {
      const newState = [...prevState];
      newState[idx] = true;
      return newState;
    });
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
