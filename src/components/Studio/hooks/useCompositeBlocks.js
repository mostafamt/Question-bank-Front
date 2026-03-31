import React from "react";
import { v4 as uuidv4 } from "uuid";
import { initCompositeBlocks } from "../initializers";
import { cropSelectedArea, ocr } from "../../../utils/ocr";
import { saveCompositeBlocks } from "../../../services/api";
import {
  addPropsToAreasForCompositeBlocks,
  getTypeOfLabelForCompositeBlocks,
  getLabelForAreaType,
} from "../../../utils/studio";
import { colors } from "../../../constants/highlight-color";
import { uploadForStudio } from "../../../utils/upload";

const useCompositeBlocks = ({
  canvasRef,
  studioEditorRef,
  language,
  chapterId,
  openModal,
  pages,
  activePageIndex,
  areasProperties,
  compositeBlocksTypes,
  changePageByIndex,
}) => {
  const [compositeBlocks, setCompositeBlocks] = React.useState(() =>
    initCompositeBlocks()
  );

  // Ref to always access latest compositeBlocks (avoids stale closures from memoization)
  const compositeBlocksRef = React.useRef(compositeBlocks);
  React.useEffect(() => {
    compositeBlocksRef.current = compositeBlocks;
  }, [compositeBlocks]);

  const [loadingSubmitCompositeBlocks, setLoadingSubmitCompositeBlocks] =
    React.useState(false);

  const onChangeCompositeBlocks = (id, key, value) => {
    setCompositeBlocks((prev) => {
      if (!id) {
        // Changing name or type — clear ALL areas across ALL pages
        return {
          ...prev,
          [key]: value,
          areas: [],
        };
      }
      return {
        ...prev,
        areas: prev.areas.map((item) =>
          item.id === id ? { ...item, [key]: value } : item
        ),
      };
    });
  };

  const DeleteCompositeBlocks = (id) => {
    setCompositeBlocks((prev) => ({
      ...prev,
      areas: prev.areas.filter((item) => item.id !== id),
    }));
  };

  const processCompositeBlock = async (id, typeOfLabel) => {
    // Set loading on the area
    setCompositeBlocks((prev) => ({
      ...prev,
      areas: prev.areas.map((item) =>
        item.id === id ? { ...item, loading: true } : item
      ),
    }));

    const { naturalWidth, clientWidth, clientHeight } =
      studioEditorRef.current.studioEditorSelectorRef.current;

    const ratio = naturalWidth / clientWidth;

    const selectedBlock = compositeBlocksRef.current.areas.find(
      (item) => item.id === id
    );
    const x = ((selectedBlock.x * ratio) / 100) * clientWidth;
    const y = ((selectedBlock.y * ratio) / 100) * clientHeight;
    const width = ((selectedBlock.width * ratio) / 100) * clientWidth;
    const height = ((selectedBlock.height * ratio) / 100) * clientHeight;

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

    setCompositeBlocks((prev) => ({
      ...prev,
      areas: prev.areas.map((item) =>
        item.id === id
          ? { ...item, loading: false, img, text }
          : item
      ),
    }));
  };

  const onSubmitCompositeBlocks = async () => {
    setLoadingSubmitCompositeBlocks(true);
    const current = compositeBlocksRef.current;

    const blocks = await Promise.all(
      current.areas.map(async ({ type, text, img, x, y, width, height, unit, pageIndex }) => {
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
          pageId: pages[pageIndex]?._id,
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

    const response = await saveCompositeBlocks({
      name: current.name,
      type: current.type,
      chapterId,
      blocks,
    });

    if (response) {
      setCompositeBlocks(initCompositeBlocks());
    }

    setLoadingSubmitCompositeBlocks(false);
  };

  const onChangeCompositeBlockArea = (areasParam) => {
    setCompositeBlocks((prev) => {
      // Build active-page view so addPropsToAreasForCompositeBlocks index-matches correctly
      const activeView = {
        ...prev,
        areas: prev.areas.filter((a) => a.pageIndex === activePageIndex),
      };
      const updated = addPropsToAreasForCompositeBlocks(activeView, areasParam);
      // Tag any new areas (no pageIndex yet) with the active page
      const updatedAreas = updated.areas.map((a) =>
        a.pageIndex === undefined ? { ...a, pageIndex: activePageIndex } : a
      );
      return {
        ...prev,
        areas: [
          ...prev.areas.filter((a) => a.pageIndex !== activePageIndex),
          ...updatedAreas,
        ],
      };
    });
  };

  const onClickHand = () => {
    // Pass filtered active-page view to the modal for color tracking
    const currentCompositeBlocks = {
      ...compositeBlocksRef.current,
      areas: compositeBlocksRef.current.areas.filter(
        (a) => a.pageIndex === activePageIndex
      ),
    };

    openModal("composite-blocks-modal", {
      compositeBlocksTypes,
      onSelectObject: (blockId) => {
        // Prevent adding the same block twice
        if (compositeBlocksRef.current.areas.some((a) => a.blockId === blockId)) return;

        // Find the selected object in areasProperties and its page index
        let selectedObject = null;
        let areaPageIndex = activePageIndex;

        for (let i = 0; i < areasProperties.length; i++) {
          const found = areasProperties[i].find(
            (area) => area.blockId === blockId
          );
          if (found) {
            selectedObject = found;
            areaPageIndex = i;
            break;
          }
        }

        if (!selectedObject) {
          console.error("Selected object not found in areasProperties");
          return;
        }

        // Auto-detect the matching label for this area's type
        const latestCompositeBlocks = compositeBlocksRef.current;
        const matchedLabel = getLabelForAreaType(
          compositeBlocksTypes,
          latestCompositeBlocks.type,
          selectedObject.type
        );
        const autoColor = matchedLabel
          ? colors[Math.floor(Math.random() * colors.length)]
          : "";

        const newArea = {
          id: uuidv4(),
          x: selectedObject.x,
          y: selectedObject.y,
          width: selectedObject.width,
          height: selectedObject.height,
          unit: "%",
          type: matchedLabel,
          text: selectedObject.text,
          blockId: blockId,
          color: autoColor,
          loading: false,
          open: true,
          img: null,
          pageIndex: areaPageIndex,
        };

        setCompositeBlocks((prev) => ({
          ...prev,
          areas: [...prev.areas, newArea],
        }));

        // Navigate to the area's original page
        changePageByIndex(areaPageIndex);
      },
      compositeBlocks: currentCompositeBlocks, // modal uses this for color tracking
      pages,
      areasProperties,
    });
  };

  // Active page's composite block — consumed by the UI
  const activeCompositeBlock = {
    ...compositeBlocks,
    areas: compositeBlocks.areas.filter(
      (area) => area.pageIndex === activePageIndex
    ),
  };

  return {
    compositeBlocks,
    activeCompositeBlock,
    totalAreas: compositeBlocks.areas.length,
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
