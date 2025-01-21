import React from "react";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { v4 as uuidv4 } from "uuid";
import { IconButton, TextField } from "@mui/material";

import styles from "./illustrativeInteractions.module.scss";

const list = [
  {
    id: uuidv4(),
    label: "Illustrative Object 1",
  },
  {
    id: uuidv4(),
    label: "Illustrative Object 2",
  },
  {
    id: uuidv4(),
    label: "Illustrative Object 3",
  },
];

const IllustrativeInteractions = () => {
  return (
    <div className={styles["illustrative-interactions"]}>
      <div>
        <TextField variant="outlined" />
        <IconButton>
          <AddIcon color="secondary" />
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
              <IconButton>
                <EditIcon color="primary" />
              </IconButton>
              <IconButton>
                <DeleteIcon color="error" />
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
export default IllustrativeInteractions;
