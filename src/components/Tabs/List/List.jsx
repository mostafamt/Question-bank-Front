import React from "react";
import AddIcon from "@mui/icons-material/Add";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton } from "@mui/material";

import styles from "./list.module.scss";

const List = (props) => {
  const {
    openModal,
    setModalName,
    checkedObjects,
    setCheckedObjects,
    setWorkingArea,
  } = props;

  const onClickPlus = () => {
    setModalName("tabs");
    openModal();
  };

  const onClickDelete = (id) => {
    setCheckedObjects((prevState) =>
      prevState.filter((item) => item.id !== id)
    );
  };

  const onClickPlay = (item) => {
    setWorkingArea({
      text: item.id,
      contentValue: item.id,
      contentType: item.type,
      typeOfLabel: item.type,
    });
    setModalName("play-object");
    openModal();
  };

  return (
    <div className={styles["illustrative-interactions"]}>
      <div>
        <IconButton onClick={onClickPlus} color="primary">
          <AddIcon color="primary" />
        </IconButton>
      </div>
      <ul>
        {checkedObjects?.map((item, idx) => (
          <li key={item.id}>
            <span>
              <span>{item.name}</span>
            </span>
            <span>
              <IconButton onClick={() => onClickPlay(item)}>
                <PlayArrowIcon />
              </IconButton>
            </span>
            <span>
              <IconButton onClick={() => onClickDelete(item.id)}>
                <DeleteIcon color="error" />
              </IconButton>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default List;
