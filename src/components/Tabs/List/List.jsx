import React from "react";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button, CircularProgress, IconButton } from "@mui/material";
import { useStore } from "../../../store/store";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getTabObjects, updateTabObjects } from "../../../services/api";
import ListItem from "../ListItem/ListItem";
import { useForm } from "react-hook-form";

import styles from "./list.module.scss";

const tabsMapping = {
  Recalls: "recalls",
  "Micro Learning": "micro-los",
  "Enriching Content": "enriching-contents",
  "Check Yourself": "exercises",
  "Illustrative Interactions": "illustrative-objects",
};

const List = (props) => {
  const { tabName, chapterId, reader } = props;

  const { openModal, setFormState } = useStore();

  const { handleSubmit } = useForm();

  const { data: tabObjects, isFetching } = useQuery({
    queryKey: [`tab-objects-${tabName}`],
    queryFn: () => getTabObjects(chapterId, tabsMapping[tabName]),
    refetchOnWindowFocus: false,
  });

  const [objects, setObjects] = React.useState([]);

  console.log("tabObjects= ", tabObjects);

  const mutation = useMutation({
    mutationFn: (bodyData) =>
      updateTabObjects(chapterId, tabsMapping[tabName], bodyData),
  });

  React.useEffect(() => {
    setFormState((prevState) => ({
      ...prevState,
      activeTab: tabName,
    }));
  }, []);

  React.useEffect(() => {
    if (!tabObjects) return;

    setObjects(tabObjects);
  }, [tabObjects, tabName, setObjects]);

  const onClickPlus = () => {
    openModal("tabs", {
      checkedObjects: objects,
      setCheckedObjects: setObjects,
      source: tabName,
    });
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
    if (!objects.length) return <p>{tabName} is empty</p>;

    return objects.map((item) => (
      <ListItem
        key={item._id}
        item={item}
        onPlay={() => handlePlay(item)}
        onDelete={() => handleDelete(item._id)}
        reader={reader}
      />
    ));
  }, [objects, tabName, isFetching, handleDelete, handlePlay]);

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
