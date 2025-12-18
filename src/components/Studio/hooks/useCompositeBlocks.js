import React from "react";
import { initCompositeBlocks } from "../initializers";
import { cropSelectedArea, ocr } from "../../../utils/ocr";
import { saveCompositeBlocks } from "../../../services/api";
import { addPropsToAreasForCompositeBlocks } from "../../../utils/studio";

const useCompositeBlocks = ({
  canvasRef,
  studioEditorRef,
  language,
  chapterId,
}) => {
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

  const processCompositeBlock = async (id, typeOfLabel) => {
    setCompositeBlocks((prevState) => {
      const newAreas = prevState?.areas?.map((item) => {
        if (item.id === id) {
          item.loading = true;
        }
        return item;
      });
      return { ...prevState, areas: newAreas };
    });

    const { naturalWidth, clientWidth, clientHeight } =
      studioEditorRef.current.studioEditorSelectorRef.current;

    const ratio = naturalWidth / clientWidth;

    const selecedBlock = compositeBlocks.areas.find((item) => item.id === id);
    const x = ((selecedBlock.x * ratio) / 100) * clientWidth;
    const y = ((selecedBlock.y * ratio) / 100) * clientHeight;
    const width = ((selecedBlock.width * ratio) / 100) * clientWidth;
    const height = ((selecedBlock.height * ratio) / 100) * clientHeight;

    const img = cropSelectedArea(
      canvasRef,
      studioEditorRef.current.studioEditorSelectorRef,
      x,
      y,
      width,
      height
    );

    let text = "";
    if (typeOfLabel === "text") {
      text = await ocr(language, img);
    }

    setCompositeBlocks((prevState) => {
      const newAreas = prevState?.areas?.map((item) => {
        if (item.id === id) {
          item = {
            ...item,
            loading: false,
            img: img,
            text: text,
          };
        }
        return item;
      });
      return { ...prevState, areas: newAreas };
    });
  };

  const onSubmitCompositeBlocks = async () => {
    setLoadingSubmitCompositeBlocks(true);

    const blocks = compositeBlocks.areas.map(
      ({ type, text, x, y, width, height, unit }) => ({
        contentType: type,
        contentValue: text,
        coordinates: {
          height,
          unit: unit === "%" ? "percentage" : "px",
          width,
          x,
          y,
        },
      })
    );

    const data = {
      name: compositeBlocks.name,
      type: compositeBlocks.type,
      chapterId,
      blocks,
    };

    const id = await saveCompositeBlocks(data);

    setLoadingSubmitCompositeBlocks(false);
  };

  const onChangeCompositeBlockArea = (areasParam) => {
    console.log("onChangeCompositeBlockArea");
    const compositeBlocksWithPropsAreas = addPropsToAreasForCompositeBlocks(
      compositeBlocks,
      areasParam
    );

    setCompositeBlocks(compositeBlocksWithPropsAreas);
  };

  return {
    compositeBlocks,
    setCompositeBlocks,
    loadingSubmitCompositeBlocks,
    onChangeCompositeBlocks,
    DeleteCompositeBlocks,
    processCompositeBlock,
    onSubmitCompositeBlocks,
    onChangeCompositeBlockArea,
  };
};

export default useCompositeBlocks;
