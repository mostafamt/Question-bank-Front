import React from "react";
import CheckIcon from "@mui/icons-material/Check";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { v4 as uuidv4 } from "uuid";
import { IconButton, TextField } from "@mui/material";

import styles from "./list.module.scss";

const List = (props) => {
  const [list, setList] = React.useState(props.data);
  const [text, setText] = React.useState("");
  const [updatedId, setUpdatedId] = React.useState("");

  const onClickAdd = (label) => {
    if (updatedId) {
      onClickUpdate(updatedId, label);
      return;
    }
    setList((prevState) => [
      ...prevState,
      {
        id: uuidv4(),
        label: label,
      },
    ]);
    reset();
  };

  const onClickEdit = (id) => {
    setText(list.find((item) => item.id === id).label);
    setUpdatedId(id);
  };

  const onClickUpdate = (id, label) => {
    const newList = list.map((item) => {
      if (item.id === id) {
        return {
          id,
          label,
        };
      }
      return item;
    });
    setList(newList);
    reset();
  };

  const onClickDelete = (id) => {
    setList((prevState) => prevState.filter((item) => item.id !== id));
  };

  const reset = () => {
    setText("");
    setUpdatedId("");
  };

  return (
    <div className={styles["illustrative-interactions"]}>
      <div>
        <TextField
          variant="outlined"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <IconButton onClick={() => onClickAdd(text)}>
          <CheckIcon color="secondary" />
        </IconButton>
      </div>
      <ul>
        {list.map((item, idx) => (
          <li key={item.id}>
            <span>
              {/* <span>{idx + 1}- </span> */}
              <span>{item.label}</span>
            </span>
            <span>
              <IconButton onClick={() => onClickEdit(item.id)}>
                <EditIcon color="primary" />
              </IconButton>
              <IconButton>
                <DeleteIcon
                  color="error"
                  onClick={() => onClickDelete(item.id)}
                />
              </IconButton>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

{
  /* <IconButton aria-label="delete">
  <DeleteIcon />
</IconButton> */
}
export default List;
