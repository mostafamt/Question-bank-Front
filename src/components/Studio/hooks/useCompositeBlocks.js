import React from "react";
import { v4 as uuidv4 } from "uuid";
import { initCompositeBlocks } from "../initializers";
import { cropSelectedArea, ocr } from "../../../utils/ocr";
import { saveCompositeBlocks } from "../../../services/api";
import { addPropsToAreasForCompositeBlocks } from "../../../utils/studio";
import { colors } from "../../../constants/highlight-color";

const useCompositeBlocks = ({
  canvasRef,
  studioEditorRef,
  language,
  chapterId,
  openModal,
  pages,
  areasProperties,
}) => {
  const [compositeBlocks, setCompositeBlocks] =
    React.useState(initCompositeBlocks);

  const [loadingSubmitCompositeBlocks, setLoadingSubmitCompositeBlocks] =
    React.useState(false);

  const onChangeCompositeBlocks = (id, key, value) => {
    // change type of composite blocks
    if (!id) {
      setCompositeBlocks((prevState) => ({
        ...prevState,
        [key]: value,
        areas: [],
      }));
      return;
    }

    // update area item
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

    const response = await saveCompositeBlocks(data);
    if (response) {
      setCompositeBlocks(initCompositeBlocks);
    }

    setLoadingSubmitCompositeBlocks(false);
  };

  const onChangeCompositeBlockArea = (areasParam) => {
    const compositeBlocksWithPropsAreas = addPropsToAreasForCompositeBlocks(
      compositeBlocks,
      areasParam
    );

    setCompositeBlocks(compositeBlocksWithPropsAreas);
  };

  const onClickHand = () => {
    openModal("composite-blocks-modal", {
      onSelectObject: (blockId) => {
        // Find the selected object in areasProperties to get coordinates
        let selectedObject = null;
        let pageIndex = -1;

        for (let i = 0; i < areasProperties.length; i++) {
          const found = areasProperties[i].find(
            (area) => area.blockId === blockId
          );
          if (found) {
            selectedObject = found;
            pageIndex = i;
            break;
          }
        }

        if (!selectedObject) {
          console.error("Selected object not found in areasProperties");
          return;
        }

        // Create new composite block area with object's coordinates
        const newArea = {
          id: uuidv4(),
          x: selectedObject.x,
          y: selectedObject.y,
          width: selectedObject.width,
          height: selectedObject.height,
          unit: "%", // Use percentage for consistency
          type: "", // Will be set by user in UI
          text: blockId, // Set blockId as text
          color: colors[compositeBlocks.areas.length % colors.length],
          loading: false,
          open: false,
          img: null,
        };

        // Add new area to composite blocks
        setCompositeBlocks((prevState) => ({
          ...prevState,
          areas: [...prevState.areas, newArea],
        }));
      },
      pages,
      areasProperties,
    });
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
    onClickHand,
  };
};

export default useCompositeBlocks;
