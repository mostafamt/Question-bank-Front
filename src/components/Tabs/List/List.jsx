import React from "react";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button, CircularProgress, IconButton } from "@mui/material";
import { useStore } from "../../../store/store";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getTabObjects, updateTabObjects } from "../../../services/api";
import ListItem from "../ListItem/ListItem";
import { useForm } from "react-hook-form";

import styles from "./list.module.scss";
import { RIGHT_TAB_NAMES } from "../../Studio/constants";
import GlossaryListItem from "../GlossaryListItem/GlossaryListItem";

const List = (props) => {
  const { tab, chapterId, reader } = props;

  const { openModal, setFormState } = useStore();

  const [open, setOpen] = React.useState([]);

  const { handleSubmit } = useForm();

  const { data: tabObjects, isFetching } = useQuery({
    queryKey: [`tab-objects-${tab.name}`],
    queryFn: () => getTabObjects(chapterId, tab.name),
    refetchOnWindowFocus: false,
  });

  const [objects, setObjects] = React.useState([]);

  console.log("tabObjects= ", tabObjects);

  const mutation = useMutation({
    mutationFn: (bodyData) => updateTabObjects(chapterId, tab.name, bodyData),
  });

  React.useEffect(() => {
    setFormState((prevState) => ({
      ...prevState,
      activeTab: tab.name,
    }));
  }, []);

  React.useEffect(() => {
    setOpen(Array(tabObjects?.length).fill(false));
  }, [tabObjects]);

  React.useEffect(() => {
    if (!tabObjects) return;

    setObjects(tabObjects);
  }, [tabObjects, tab, setObjects]);

  const onClickPlus = () => {
    openModal("tabs", {
      checkedObjects: objects,
      setCheckedObjects: setObjects,
      source: tab.name,
    });
  };

  const handleClick = (idx) => {
    console.log("handleClick");
    console.log("idx= ", idx);
    console.log("open= ", open);
    setOpen((prevState) =>
      prevState.map((item, id) => (id === idx ? !item : item))
    );
  };

  const handlePlay = React.useCallback(
    (item) => {
      openModal("play-object", {
        workingArea: {
          text: item._id,
          contentValue: item._id,
          contentType: item.type || "Text MCQ",
          typeOfLabel: item.type,
        },
      });
    },
    [openModal]
  );

  const handleDelete = React.useCallback(
    (id) => {
      if (!id) return;
      setObjects((prevState) => prevState.filter((item) => item._id !== id));
    },
    [setObjects]
  );

  const onSubmitHandler = async () => {
    const ids = {
      ids: objects.map((item) => item._id),
    };

    mutation.mutate(ids);
  };

  const objectsList = React.useMemo(() => {
    if (isFetching) return <CircularProgress size="1rem" />;
    if (!objects.length) return <p>{tab.label} is empty</p>;

    if (tab.name === RIGHT_TAB_NAMES.GLOSSARY_KEYWORDS.name) {
      return objects.map((item, idx) => (
        // item, handleClick, idx, open
        <GlossaryListItem
          key={item.id || idx}
          item={item}
          handleClick={handleClick}
          idx={idx}
          open={false}
          reader={reader}
        />
      ));
    } else {
      return objects.map((item) => (
        <ListItem
          key={item._id}
          item={item}
          onPlay={() => handlePlay(item)}
          onDelete={() => handleDelete(item._id)}
          reader={reader}
        />
      ));
    }
  }, [objects, tab, isFetching, handleDelete, handlePlay]);

  return (
    <form
      onSubmit={handleSubmit(onSubmitHandler)}
      className={styles["illustrative-interactions"]}
    >
      {!reader && (
        <div>
          <IconButton onClick={onClickPlus} color="primary">
            <AddIcon color="primary" />
          </IconButton>
        </div>
      )}
      <ul>{objectsList}</ul>

      {!reader && (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button
            variant="contained"
            type="submit"
            disabled={mutation.isLoading}
            startIcon={
              mutation.isLoading ? <CircularProgress size="1rem" /> : <></>
            }
          >
            Submit
          </Button>
        </Box>
      )}
    </form>
  );
};

export default List;
