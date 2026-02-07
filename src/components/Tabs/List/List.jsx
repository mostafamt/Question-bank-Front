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
  const { tab, chapterId, reader, changePageById, navigateToBlock } = props;

  const { openModal, setFormState } = useStore();

  const [open, setOpen] = React.useState([]);

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  const { data: tabObjects, isFetching } = useQuery({
    queryKey: [`tab-objects-${tab.name}`],
    queryFn: () => getTabObjects(chapterId, tab.name),
    refetchOnWindowFocus: false,
  });

  const [objects, setObjects] = React.useState([]);

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
    if (tab.name === RIGHT_TAB_NAMES.GLOSSARY_KEYWORDS.name) {
      // Open glossary modal for adding new term
      openModal("glossary", {
        title: "Add Glossary Term",
        onSubmit: (term, definition) => {
          // Add the new glossary item to the list
          const newItem = {
            _id: Date.now().toString(), // Temporary ID
            term,
            definition,
            references: [],
          };
          setObjects((prevState) => [...prevState, newItem]);
        },
      });
    } else {
      openModal("tabs", {
        checkedObjects: objects,
        setCheckedObjects: setObjects,
        source: tab.name,
      });
    }
  };

  const handleClick = (idx) => {
    setOpen((prevState) =>
      prevState.map((item, id) => (id === idx ? !item : item))
    );
  };

  const handlePlay = React.useCallback(
    (item) => {
      console.log("item.baseType= ", item.baseType);
      openModal("play-object", {
        workingArea: {
          text: item._id,
          contentValue: item._id,
          contentType: item.baseType || "Text MCQ",
          typeOfLabel: item.type,
        },
      });
    },
    [openModal]
  );

  const handleDelete = React.useCallback(
    (id) => {
      if (!id) return;

      if (tab.name === RIGHT_TAB_NAMES.GLOSSARY_KEYWORDS.name) {
        setObjects((prevState) =>
          prevState.map((item) =>
            item._id === id ? { ...item, status: "deleted" } : item
          )
        );
      } else {
        setObjects((prevState) => prevState.filter((item) => item._id !== id));
      }
    },
    [setObjects, tab.name]
  );

  const handleEdit = React.useCallback(
    (item) => {
      openModal("glossary", {
        term: item.term,
        definition: item.definition,
        title: "Edit Glossary Term",
        onSubmit: (term, definition) => {
          // Update the item in the list
          setObjects((prevState) =>
            prevState.map((obj) =>
              obj._id === item._id ? { ...obj, term, definition } : obj
            )
          );
        },
      });
    },
    [openModal, setObjects]
  );

  const handleMoveUp = React.useCallback(
    (item) => {
      if (!item?.references?.length) {
        console.warn("Item has no references:", item);
        return;
      }

      const { pageId, blockId } = item.references[0];

      if (navigateToBlock) {
        navigateToBlock(pageId, blockId);
      } else if (changePageById) {
        changePageById(pageId);
      }
    },
    [navigateToBlock, changePageById]
  );

  const handleMoveDown = React.useCallback(
    (item) => {
      if (!item?.references?.length) {
        console.warn("Item has no references:", item);
        return;
      }

      // Navigate to first reference (same as handleMoveUp for now)
      const { pageId, blockId } = item.references[0];

      if (navigateToBlock) {
        navigateToBlock(pageId, blockId);
      } else if (changePageById) {
        changePageById(pageId);
      }
    },
    [navigateToBlock, changePageById]
  );

  const onSubmitHandler = async () => {
    const ids = {
      ids: objects.map((item) => item._id),
    };

    if (tab.name === RIGHT_TAB_NAMES.GLOSSARY_KEYWORDS.name) {
      console.log("objects= ", objects);
      await mutation.mutateAsync(objects);
    } else {
      await mutation.mutateAsync(ids);
    }
  };

  const objectsList = React.useMemo(() => {
    if (isFetching) return <CircularProgress size="1rem" />;
    if (!objects.length) return <p>{tab.label} is empty</p>;

    if (tab.name === RIGHT_TAB_NAMES.GLOSSARY_KEYWORDS.name) {
      return objects
        .filter((item) => item.status !== "deleted")
        .map((item, idx) => (
          <GlossaryListItem
            key={item.id || idx}
            item={item}
            handleClick={handleClick}
            idx={idx}
            open={open}
            onPlay={() => handlePlay(item)}
            onEdit={() => handleEdit(item)}
            onDelete={() => handleDelete(item._id)}
            onMoveUp={() => handleMoveUp(item)}
            onMoveDown={() => handleMoveDown(item)}
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
  }, [
    objects,
    tab,
    isFetching,
    open,
    handleClick,
    handleDelete,
    handleEdit,
    handlePlay,
    handleMoveUp,
    handleMoveDown,
  ]);

  return (
    <form
      onSubmit={handleSubmit(onSubmitHandler)}
      className={styles["illustrative-interactions"]}
    >
      {!reader && (
        <div>
          <IconButton onClick={onClickPlus} color="primary" size="large">
            <AddIcon color="primary" fontSize="large" />
          </IconButton>
        </div>
      )}
      <ul>{objectsList}</ul>

      {!reader && (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button
            variant="contained"
            type="submit"
            disabled={mutation.isPending}
            startIcon={
              mutation.isPending ? <CircularProgress size="1rem" /> : <></>
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
