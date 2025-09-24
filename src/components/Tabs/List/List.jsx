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
};

const List = (props) => {
  const {
    openModal,
    setModalName,
    checkedObjects,
    setCheckedObjects,
    setWorkingArea,
    tabName,
    chapterId,
  } = props;

  const { setFormState } = useStore();

  const { handleSubmit } = useForm();

  const { data: tabObjects, isFetching } = useQuery({
    queryKey: [`tab-objects-${tabName}`],
    queryFn: () => getTabObjects(chapterId, tabsMapping[tabName]),
    refetchOnWindowFocus: false,
  });

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

    setCheckedObjects((prevState) => {
      return prevState.map((tab) => {
        if (tab.label === tabName) {
          return {
            ...tab,
            objects: [
              ...tabObjects?.map((item) => ({
                ...item,
                id: item._id,
              })),
            ],
          };
        }
        return tab;
      });
    });
  }, [tabObjects, tabName, setCheckedObjects]);

  const onClickPlus = () => {
    setModalName("tabs");
    openModal();
  };

  const handlePlay = React.useCallback(
    (item) => {
      setWorkingArea({
        text: item.id,
        contentValue: item.id,
        contentType: item.type,
        typeOfLabel: item.type,
      });
      setModalName("play-object");
      openModal();
    },
    [setWorkingArea, setModalName, openModal]
  );

  const handleDelete = React.useCallback(
    (id) => {
      if (!id) return;
      setCheckedObjects((prevState) =>
        prevState.map((tab) =>
          tab.label === tabName
            ? { ...tab, objects: tab.objects.filter((item) => item.id !== id) }
            : tab
        )
      );
    },
    [setCheckedObjects, tabName]
  );

  const onSubmitHandler = async () => {
    const ids = {
      ids: checkedObjects
        .find((tab) => tab.label === tabName)
        ?.objects?.map((item) => item.id),
    };

    mutation.mutate(ids);
  };

  const objectsList = React.useMemo(() => {
    const list =
      checkedObjects?.find((tab) => tab.label === tabName)?.objects || [];

    if (isFetching) return <CircularProgress size="1rem" />;
    if (!list.length) return <p>{tabName} is empty</p>;

    return list.map((item) => (
      <ListItem
        key={item.id}
        item={item}
        onPlay={handlePlay}
        onDelete={handleDelete}
      />
    ));
  }, [checkedObjects, tabName, isFetching, handleDelete, handlePlay]);

  return (
    <form
      onSubmit={handleSubmit(onSubmitHandler)}
      className={styles["illustrative-interactions"]}
    >
      <div>
        <IconButton onClick={onClickPlus} color="primary">
          <AddIcon color="primary" />
        </IconButton>
      </div>
      <ul>{objectsList}</ul>

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
    </form>
  );
};

export default List;
