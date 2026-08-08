import React from "react";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";

import { initAreas, initAreasProperties } from "../initializers";
import {
  validateRefAccess,
  processPageAreas,
} from "../services/coordinate.service";
import { deleteAreaByIndex } from "../utils";
import { isDeepBlock } from "../utils";
import {
  CREATED,
  DELETED,
  onEditTextField,
  reorder,
  updateAreasProperties,
} from "../../../utils/ocr";
import { parseVirtualBlocksFromPages } from "../../../utils/virtual-blocks";
import { TIMEOUTS } from "../constants";
import { capturePageSnapshot } from "../services/pageCapture.service";

const useAreaManagement = ({
  pages,
  activePageIndex,
  types,
  studioEditorRef,
  subObject = false,
  type,
  handleSubmit,
  updateAreaPropertyForParent,
  activePageId,
  virtualBlocks,
  refetch,
  pageContainerRef,
  setShowBlocksStyling,
}) => {
  // Store raw pages for deferred conversion (% → px on first image load)
  const rawPagesRef = React.useRef(pages);

  // Start with empty arrays — areas are populated after image loads with real pixel values
  const [areas, setAreas] = React.useState(() => pages.map(() => []));

  const [loadingSubmit, setLoadingSubmit] = React.useState(false);

  const [areasProperties, setAreasProperties] = React.useState(() =>
    initAreasProperties(pages, types)
  );

  const [showVB, setShowVB] = React.useState(false);

  // Track deleted deep block areas for white background rendering during snapshot
  // Structure: deletedDeepBlockAreas[pageIndex] = [{ id, x, y, width, height, unit }, ...]
  const [deletedDeepBlockAreas, setDeletedDeepBlockAreas] = React.useState(() =>
    pages.map(() => [])
  );

  // When pages grows (e.g. after a new page is added and refetched), append
  // empty entries so areas/areasProperties stay in sync with the pages array.
  React.useEffect(() => {
    setAreas((prev) => {
      if (prev.length >= pages.length) return prev;
      return [...prev, ...Array(pages.length - prev.length).fill([])];
    });
    setAreasProperties((prev) => {
      if (prev.length >= pages.length) return prev;
      return [...prev, ...Array(pages.length - prev.length).fill([])];
    });
    setDeletedDeepBlockAreas((prev) => {
      if (prev.length >= pages.length) return prev;
      return [...prev, ...Array(pages.length - prev.length).fill([])];
    });
  }, [pages.length]);

  const getBlockFromBlockId = (id) => {
    if (!id) return null;

    // Search inside areas for all pages
    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      const areaBlock = areasProperties[pageIndex]?.find((a) => {
        return a.id === id;
      });

      if (areaBlock) {
        return {
          ...areaBlock,
          pageIndex,
          type: "area",
        };
      }
    }

    console.warn(`Block with id "${id}" not found.`);
    return null;
  };

  /**
   * Recalculates area pixel coordinates based on the currently loaded image's dimensions.
   *
   * On first call for a page (areas are empty), builds areas from raw API data
   * and converts % → px in one step. On subsequent calls (zoom, virtual blocks),
   * reconverts existing areas using stored percentage metadata.
   */
  const recalculateAreas = () => {
    setAreas((prevState) => {
      const refValidation = validateRefAccess(studioEditorRef);
      if (!refValidation.isValid) return prevState;

      const { dimensions } = refValidation;
      const newAreas = [...prevState];
      const activePageAreas = newAreas[activePageIndex];

      // First load: page has no areas yet — build from raw API data + convert
      if (
        (!activePageAreas || activePageAreas.length === 0) &&
        rawPagesRef.current[activePageIndex]?.blocks?.length
      ) {
        const rawAreas = initAreas([rawPagesRef.current[activePageIndex]])[0];
        newAreas[activePageIndex] = processPageAreas(
          rawAreas,
          areasProperties[activePageIndex],
          dimensions
        );
        return newAreas;
      }

      // Subsequent calls (zoom, virtual blocks): reconvert existing areas
      if (activePageAreas?.length) {
        newAreas[activePageIndex] = processPageAreas(
          activePageAreas,
          areasProperties[activePageIndex],
          dimensions
        );
      }

      return newAreas;
    });
  };

  const updateAreaProperty = (idx, property) => {
    setAreasProperties((prevState) => {
      let newTrialAreas = [...prevState];
      if (idx === -1) {
        const lastIndex = idx + areasProperties[activePageIndex].length;
        newTrialAreas[activePageIndex][lastIndex] = {
          ...newTrialAreas[activePageIndex][lastIndex],
          ...property,
        };
      } else {
        newTrialAreas[activePageIndex][idx] = {
          ...newTrialAreas[activePageIndex][idx],
          ...property,
        };
      }
      return newTrialAreas;
    });
  };

  /**
   * Handle area deletion
   * - First checks if area exists in areas array
   * - Deep blocks: Store for white background rendering, then proceed with deletion
   * - Server areas: Mark as DELETED status (soft delete)
   * - Client areas: Remove from both arrays (hard delete)
   * @param {number} idx - Index of area to delete
   */
  const onClickDeleteArea = React.useCallback(
    (idx) => {
      // 1. Check areas first (source of truth for rendered areas)
      const area = areas[activePageIndex]?.[idx];

      if (!area) {
        console.warn(
          `Cannot delete area at index ${idx}: area not found in areas`
        );
        return;
      }

      // 2. Get corresponding areaProps for server status check
      const areaProps = areasProperties[activePageIndex]?.[idx];

      // 3. Check if this is a deep block and store coordinates for white rendering
      // Only store if it's server-side (has a snapshot to render the overlay on)
      if (isDeepBlock(areaProps) && areaProps?.isServer) {
        addDeletedDeepBlockArea(area, areaProps);
      }

      // 4. Determine delete strategy based on server status
      if (areaProps?.isServer) {
        // Soft delete: mark as deleted for server sync
        updateAreaProperty(idx, { status: DELETED });
      } else {
        // Hard delete: remove from both arrays using callback form
        setAreas((prevAreas) =>
          deleteAreaByIndex(prevAreas, activePageIndex, idx)
        );
        setAreasProperties((prevProps) =>
          deleteAreaByIndex(prevProps, activePageIndex, idx)
        );
      }
    },
    [activePageIndex, areas, areasProperties, updateAreaProperty]
  );

  const updateAreaPropertyById = (id, property) => {
    const newAreasProperties = [...areasProperties];
    newAreasProperties[activePageIndex] = newAreasProperties[
      activePageIndex
    ].map((area) => {
      if (area.id === id) {
        return {
          ...area,
          ...property,
        };
      }
      return area;
    });
    setAreasProperties(newAreasProperties);
  };

  const addDeletedDeepBlockArea = (area, areaProps) => {
    setDeletedDeepBlockAreas((prevState) => {
      const newDeletedAreas = [...prevState];
      newDeletedAreas[activePageIndex] = [
        ...newDeletedAreas[activePageIndex],
        {
          id: areaProps.id,
          x: area._percentX ?? area.x,
          y: area._percentY ?? area.y,
          width: area._percentWidth ?? area.width,
          height: area._percentHeight ?? area.height,
          unit: area._unit || "percentage",
        },
      ];
      return newDeletedAreas;
    });
  };

  const onEditText = (id, text) => {
    const newAreasProperties = onEditTextField(
      areasProperties,
      activePageIndex,
      id,
      text
    );
    setAreasProperties(newAreasProperties);
  };

  const syncAreasProperties = (areasToSync = areas) => {
    const newAreasProperties = updateAreasProperties(
      areasProperties,
      activePageIndex,
      areasToSync,
      subObject,
      type
    );
    setAreasProperties(newAreasProperties);
  };

  const onChangeArea = (areasParam) => {
    const isNewAreaAdded = areasParam.length > areasProperties[activePageIndex].length;

    console.log("onChangeArea");
    console.log("areasParam= ", areasParam);
    // Add metadata to new areas
    const areasWithMetadata = areasParam.map((area, idx) => {
      // Check if this is an existing area
      const existingArea = areas[activePageIndex]?.[idx];

      if (existingArea) {
        // AreaSelector echoes back the SAME (px) coordinates for every area
        // not currently being dragged/resized — only the one actively being
        // edited gets genuinely fresh values. Detect that by comparing against
        // what we last stored: unchanged means static (preserve _percent*,
        // since area.x/y/width/height here are stale px, not percentages);
        // changed means this is the active area (recompute _percent* from it).
        // Using `existingArea._percentWidth ?? area.width` unconditionally
        // would freeze at a legitimate 0 (mousedown start) forever, since `??`
        // only falls back on null/undefined.
        const hasMoved =
          area.x !== existingArea.x ||
          area.y !== existingArea.y ||
          area.width !== existingArea.width ||
          area.height !== existingArea.height;

        return {
          ...area,
          _unit: existingArea._unit || "percentage",
          _updated: existingArea._updated || false,
          _percentX: hasMoved ? area.x : existingArea._percentX ?? area.x,
          _percentY: hasMoved ? area.y : existingArea._percentY ?? area.y,
          _percentWidth: hasMoved
            ? area.width
            : existingArea._percentWidth ?? area.width,
          _percentHeight: hasMoved
            ? area.height
            : existingArea._percentHeight ?? area.height,
        };
      } else {
        // New area - set metadata (AreaSelector uses percentage)
        return {
          ...area,
          _unit: "percentage",
          _updated: false,
          // Store original percentage coordinates
          _percentX: area.x,
          _percentY: area.y,
          _percentWidth: area.width,
          _percentHeight: area.height,
        };
      }
    });

    const newAreasParam = [...areas];
    newAreasParam[activePageIndex] = areasWithMetadata;
    setAreas(newAreasParam);

    // Sync areasProperties whenever areas change (new area added or existing area moved)
    if (isNewAreaAdded) {
      syncAreasProperties(newAreasParam);
    } else {
      // Check if any existing area has moved
      const hasMovedAreas = areasWithMetadata.some((area, idx) => {
        const existingArea = areas[activePageIndex]?.[idx];
        return existingArea && (
          area.x !== existingArea.x ||
          area.y !== existingArea.y ||
          area.width !== existingArea.width ||
          area.height !== existingArea.height
        );
      });
      if (hasMovedAreas) {
        syncAreasProperties(newAreasParam);
      }
    }
  };

  const onClickSubmit = async () => {
    setLoadingSubmit(true);
    if (subObject) {
      const id = await handleSubmit(areasProperties[activePageIndex]);
      updateAreaPropertyForParent(-1, { text: id });
      id && toast.success("Sub-Object created successfully!");
      // handleClose();
    } else {
      const hasDeepBlock = areasProperties[activePageIndex]?.some(isDeepBlock);
      let pageSnapshot = null;
      if (hasDeepBlock) {
        // Snapshot capture flow for deep blocks
        // White area overlays (deleted deep blocks) are automatically included in the snapshot
        // They're rendered in the page and appear as white backgrounds in the final image

        // 1. Temporarily hide area selection borders and backgrounds during capture
        setShowBlocksStyling(false);
        // 2. Give React time to update the DOM
        await new Promise((resolve) => setTimeout(resolve, 50));
        // 3. Capture snapshot (includes white areas for deleted deep blocks)
        pageSnapshot = await capturePageSnapshot(pageContainerRef.current);
        // 4. Restore area selection styling for continued editing
        setShowBlocksStyling(true);
      }
      const id = await handleSubmit(
        activePageId,
        areasProperties[activePageIndex],
        virtualBlocks[activePageIndex],
        pageSnapshot
      );
      id && toast.success("Object created successfully!");
      refetch();
    }
    // clear();
    setLoadingSubmit(false);
  };

  const insertPageAt = (insertAt, newPage) => {
    rawPagesRef.current = [
      ...rawPagesRef.current.slice(0, insertAt),
      newPage,
      ...rawPagesRef.current.slice(insertAt),
    ];
    setAreas((prev) => [
      ...prev.slice(0, insertAt),
      [],
      ...prev.slice(insertAt),
    ]);
    setAreasProperties((prev) => [
      ...prev.slice(0, insertAt),
      [],
      ...prev.slice(insertAt),
    ]);
    setDeletedDeepBlockAreas((prev) => [
      ...prev.slice(0, insertAt),
      [],
      ...prev.slice(insertAt),
    ]);
  };

  const insertPagesAt = (insertAt, newPages) => {
    const emptyArrays = newPages.map(() => []);
    rawPagesRef.current = [
      ...rawPagesRef.current.slice(0, insertAt),
      ...newPages,
      ...rawPagesRef.current.slice(insertAt),
    ];
    setAreas((prev) => [
      ...prev.slice(0, insertAt),
      ...emptyArrays,
      ...prev.slice(insertAt),
    ]);
    setAreasProperties((prev) => [
      ...prev.slice(0, insertAt),
      ...emptyArrays,
      ...prev.slice(insertAt),
    ]);
    setDeletedDeepBlockAreas((prev) => [
      ...prev.slice(0, insertAt),
      ...emptyArrays,
      ...prev.slice(insertAt),
    ]);
  };

  const deletePageAt = (pageIndex) => {
    rawPagesRef.current = rawPagesRef.current.filter((_, idx) => idx !== pageIndex);
    setAreas((prev) => prev.filter((_, idx) => idx !== pageIndex));
    setAreasProperties((prev) => prev.filter((_, idx) => idx !== pageIndex));
    setDeletedDeepBlockAreas((prev) => prev.filter((_, idx) => idx !== pageIndex));
  };

  // Reorder the per-page area structures to match a pages reorder. Must apply the
  // exact same permutation the pages array receives, otherwise blocks would attach
  // to the wrong page (areas/areasProperties are index-aligned with pages).
  const reorderPageAt = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    rawPagesRef.current = reorder(rawPagesRef.current, fromIndex, toIndex);
    setAreas((prev) => reorder(prev, fromIndex, toIndex));
    setAreasProperties((prev) => reorder(prev, fromIndex, toIndex));
    setDeletedDeepBlockAreas((prev) => reorder(prev, fromIndex, toIndex));
  };

  const onClickToggleVirutalBlocks = () => {
    setShowVB((prevState) => !prevState);
    setTimeout(() => {
      recalculateAreas();
    }, TIMEOUTS.VIRTUAL_BLOCKS_TOGGLE_DELAY);
  };

  return {
    areas,
    setAreas,
    areasProperties,
    setAreasProperties,
    deletedDeepBlockAreas,
    setDeletedDeepBlockAreas,
    insertPageAt,
    insertPagesAt,
    deletePageAt,
    reorderPageAt,
    getBlockFromBlockId,
    recalculateAreas,
    updateAreaProperty,
    onClickDeleteArea,
    updateAreaPropertyById,
    onEditText,
    syncAreasProperties,
    onChangeArea,
    onClickSubmit,
    onClickToggleVirutalBlocks,
    loadingSubmit,
  };
};

export default useAreaManagement;
