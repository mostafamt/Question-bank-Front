import React from "react";
import { v4 as uuidv4 } from "uuid";
import { initCompositeBlocks, initCompositeBlocksForPages } from "../initializers";
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
}) => {
  const [compositeBlocks, setCompositeBlocks] = React.useState(() =>
    initCompositeBlocksForPages(pages)
  );

  // Ref to always access latest compositeBlocks (avoids stale closures from memoization)
  const compositeBlocksRef = React.useRef(compositeBlocks);
  React.useEffect(() => {
    compositeBlocksRef.current = compositeBlocks;
  }, [compositeBlocks]);

  // Re-initialize when the number of pages changes (e.g. new page added)
  const pagesLengthRef = React.useRef(pages.length);
  React.useEffect(() => {
    if (pages.length !== pagesLengthRef.current) {
      pagesLengthRef.current = pages.length;
      setCompositeBlocks(initCompositeBlocksForPages(pages));
    }
  }, [pages.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const [loadingSubmitCompositeBlocks, setLoadingSubmitCompositeBlocks] =
    React.useState(false);

  const onChangeCompositeBlocks = (id, key, value) => {
    setCompositeBlocks((prev) => {
      const updated = [...prev];
      const page = { ...updated[activePageIndex] };

      if (!id) {
        // Changing name or type — reset areas for this page only
        page[key] = value;
        page.areas = [];
      } else {
        page.areas = page.areas.map((item) =>
          item.id === id ? { ...item, [key]: value } : item
        );
      }

      updated[activePageIndex] = page;
      return updated;
    });
  };

  const DeleteCompositeBlocks = (id) => {
    setCompositeBlocks((prev) => {
      const updated = [...prev];
      const page = { ...updated[activePageIndex] };
      page.areas = page.areas.filter((item) => item.id !== id);
      updated[activePageIndex] = page;
      return updated;
    });
  };

  const processCompositeBlock = async (id, typeOfLabel) => {
    // Set loading on the area
    setCompositeBlocks((prev) => {
      const updated = [...prev];
      const page = { ...updated[activePageIndex] };
      page.areas = page.areas.map((item) =>
        item.id === id ? { ...item, loading: true } : item
      );
      updated[activePageIndex] = page;
      return updated;
    });

    const { naturalWidth, clientWidth, clientHeight } =
      studioEditorRef.current.studioEditorSelectorRef.current;

    const ratio = naturalWidth / clientWidth;

    const selectedBlock = compositeBlocksRef.current[activePageIndex].areas.find(
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

    setCompositeBlocks((prev) => {
      const updated = [...prev];
      const page = { ...updated[activePageIndex] };
      page.areas = page.areas.map((item) =>
        item.id === id
          ? { ...item, loading: false, img, text }
          : item
      );
      updated[activePageIndex] = page;
      return updated;
    });
  };

  const onSubmitCompositeBlocks = async () => {
    setLoadingSubmitCompositeBlocks(true);
    const current = compositeBlocksRef.current[activePageIndex];
    const pageId = pages[activePageIndex]?._id;

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
      pageId,
      blocks,
    };

    const response = await saveCompositeBlocks(data);
    if (response) {
      // Reset only the active page, leave other pages intact
      setCompositeBlocks((prev) => {
        const updated = [...prev];
        updated[activePageIndex] = initCompositeBlocks();
        return updated;
      });
    }

    setLoadingSubmitCompositeBlocks(false);
  };

  const onChangeCompositeBlockArea = (areasParam) => {
    setCompositeBlocks((prev) => {
      const updated = [...prev];
      updated[activePageIndex] = addPropsToAreasForCompositeBlocks(
        updated[activePageIndex],
        areasParam
      );
      return updated;
    });
  };

  const onClickHand = () => {
    const currentCompositeBlocks = compositeBlocksRef.current[activePageIndex];

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

        // Auto-detect the matching label for this area's type
        const latestCompositeBlocks = compositeBlocksRef.current[activePageIndex];
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
        };

        setCompositeBlocks((prev) => {
          const updated = [...prev];
          const page = { ...updated[activePageIndex] };
          page.areas = [...page.areas, newArea];
          updated[activePageIndex] = page;
          return updated;
        });
      },
      compositeBlocks: currentCompositeBlocks, // modal uses this for color tracking
      pages,
      areasProperties,
    });
  };

  // Active page's composite block — consumed by the UI
  const activeCompositeBlock =
    compositeBlocks[activePageIndex] ?? initCompositeBlocks();

  return {
    compositeBlocks,
    activeCompositeBlock,
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
