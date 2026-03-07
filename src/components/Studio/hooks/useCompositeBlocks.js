import React from "react";
import { v4 as uuidv4 } from "uuid";
import { initCompositeBlocks } from "../initializers";
import { cropSelectedArea, ocr } from "../../../utils/ocr";
import { saveCompositeBlocks } from "../../../services/api";
import {
  addPropsToAreasForCompositeBlocks,
  getTypeOfLabelForCompositeBlocks,
} from "../../../utils/studio";
import { uploadForStudio } from "../../../utils/upload";

const useCompositeBlocks = ({
  canvasRef,
  studioEditorRef,
  language,
  chapterId,
  openModal,
  pages,
  areasProperties,
  compositeBlocksTypes,
}) => {
  const [compositeBlocks, setCompositeBlocks] =
    React.useState(initCompositeBlocks);

  // Ref to always access latest compositeBlocks (avoids stale closures from memoization)
  const compositeBlocksRef = React.useRef(compositeBlocks);
  React.useEffect(() => {
    compositeBlocksRef.current = compositeBlocks;
  }, [compositeBlocks]);

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
    const current = compositeBlocksRef.current;

    const blocks = await Promise.all(
      current.areas.map(async ({ type, text, img, x, y, width, height, unit }) => {
        const labelType = getTypeOfLabelForCompositeBlocks(
          compositeBlocksTypes,
          current.type,
          type
        );

        let contentValue = text;
        if (labelType === "image" && img) {
          contentValue = await uploadForStudio(img);
        }

        return {
          contentType: type,
          contentValue,
          coordinates: {
            height,
            unit: unit === "%" ? "percentage" : "px",
            width,
            x,
            y,
          },
        };
      })
    );

    const data = {
      name: current.name,
      type: current.type,
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
      compositeBlocksTypes,
      onSelectObject: (blockId) => {
        // Find the selected object in areasProperties to get coordinates
        let selectedObject = null;

        for (let i = 0; i < areasProperties.length; i++) {
          const found = areasProperties[i].find(
            (area) => area.blockId === blockId
          );
          if (found) {
            selectedObject = found;
            break;
          }
        }

        if (!selectedObject) {
          console.error("Selected object not found in areasProperties");
          return;
        }

        // Add area with no color — color is assigned when user picks a type
        const newArea = {
          id: uuidv4(),
          x: selectedObject.x,
          y: selectedObject.y,
          width: selectedObject.width,
          height: selectedObject.height,
          unit: "%",
          type: "",
          text: selectedObject.text, // store objectId (contentValue) sent to server
          blockId: blockId, // store blockId for modal visual tracking
          color: "",
          loading: false,
          open: true,
          img: null,
        };

        // Add new area to composite blocks
        setCompositeBlocks((prevState) => ({
          ...prevState,
          areas: [...prevState.areas, newArea],
        }));
      },
      compositeBlocks, // modal uses this to show color for blocks that have a type
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
