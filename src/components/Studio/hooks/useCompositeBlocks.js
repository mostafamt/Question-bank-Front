import React from "react";
import { initCompositeBlocks } from "../initializers";

const useCompositeBlocks = () => {
  const [compositeBlocks, setCompositeBlocks] =
    React.useState(initCompositeBlocks);

  const [loadingSubmitCompositeBlocks, setLoadingSubmitCompositeBlocks] =
    React.useState(false);

  const onChangeCompositeBlocks = (id, key, value) => {
    if (!id) {
      setCompositeBlocks((prevState) => ({
        ...prevState,
        [key]: value,
        areas: [],
      }));
      return;
    }

    setCompositeBlocks((prevState) => {
      return {
        ...prevState,
        areas: prevState?.areas?.map((item) => {
          if (item.id === id) {
            item = { ...item, [key]: value };
          }
          return item;
        }),
      };
    });
  };

  const DeleteCompositeBlocks = (id) => {
    setCompositeBlocks((prevState) => {
      const newAreas = prevState?.areas?.filter((item) => item.id !== id);
      return { ...prevState, areas: newAreas };
    });
  };

  return {
    compositeBlocks,
    setCompositeBlocks,
    loadingSubmitCompositeBlocks,
    setLoadingSubmitCompositeBlocks,
    onChangeCompositeBlocks,
    DeleteCompositeBlocks
  };
};

export default useCompositeBlocks;
