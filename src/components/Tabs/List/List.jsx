import React from "react";
import AddIcon from "@mui/icons-material/Add";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DeleteIcon from "@mui/icons-material/Delete";
import { Box, Button, IconButton } from "@mui/material";
import { useStore } from "../../../store/store";

import styles from "./list.module.scss";

const List = (props) => {
  const {
    openModal,
    setModalName,
    checkedObjects,
    setCheckedObjects,
    setWorkingArea,
    tabName,
    modalState,
  } = props;

  const { data: state, setFormState } = useStore();

  React.useEffect(() => {
    setFormState({
      ...state,
      activeTab: tabName,
    });
  }, []);

  const onClickPlus = () => {
    setModalName("tabs");
    openModal();
  };

  const onClickDelete = (id) => {
    setCheckedObjects((prevState) => {
      return prevState.map((tab) => {
        if (tab.label === tabName) {
          console.log("tab= ", tab);
          return {
            ...tab,
            objects: tab.objects.filter((item) => item.id !== id),
          };
        }
        return tab;
      });
    });
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

  const onSubmitHandler = (event) => {
    event.preventDefault();
    console.log("submitted !");
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className={styles["illustrative-interactions"]}
    >
      <div>
        <IconButton onClick={onClickPlus} color="primary">
          <AddIcon color="primary" />
        </IconButton>
      </div>
      <ul>
        {checkedObjects
          .find((obj) => obj.label === modalState?.source)
          ?.objects?.map((item, idx) => (
            <li key={item?.id ?? idx}>
              <span>{item?.name}</span>
              <span>
                <IconButton onClick={() => onClickPlay(item)}>
                  <PlayArrowIcon />
                </IconButton>
              </span>
              <span>
                <IconButton onClick={() => onClickDelete(item?.id)}>
                  <DeleteIcon color="error" />
                </IconButton>
              </span>
            </li>
          ))}
      </ul>
      {Boolean(
        checkedObjects.find((obj) => obj.label === tabName)?.objects?.length
      ) && (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button variant="contained" type="submit">
            Submit
          </Button>
        </Box>
      )}
    </form>
  );
};

export default List;
