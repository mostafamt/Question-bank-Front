import React, { useState, useMemo, useCallback } from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import { Button } from "react-bootstrap";
import StudioEditor from "../../Studio/StudioEditor/StudioEditor";
import ImageActions from "../../ImageActions/ImageActions";
import {
  getList2FromData,
  getTypeOfLabelForCompositeBlocks,
} from "../../../utils/studio";

const CompositeBlocksModal = (props) => {
  const {
    handleCloseModal,
    compositeBlockAreaId, // Composite block area ID being edited
    onSelectObject, // Callback when object is selected
    compositeBlocks, // Current composite blocks — used to reflect type-assigned colors
    compositeBlocksTypes, // Full type definitions from API
    pages, // Book pages with image URLs
    areasProperties, // Existing areas on all pages
  } = props;

  // State for page navigation and zoom
  const [activePage, setActivePage] = useState(0);
  const [imageScaleFactor, setImageScaleFactor] = useState(1);

  // Determine which area types are selectable based on composite block type's labels
  const allowedAreaTypes = useMemo(() => {
    if (!compositeBlocksTypes || !compositeBlocks?.type) {
      return ["Question", "Illustrative object"];
    }

    const labels = getList2FromData(compositeBlocksTypes, compositeBlocks.type);
    const allowed = new Set();

    labels.forEach((label) => {
      const internalType = getTypeOfLabelForCompositeBlocks(
        compositeBlocksTypes,
        compositeBlocks.type,
        label
      );
      if (internalType === "QObject") allowed.add("Question");
      if (internalType === "Object") allowed.add("Illustrative object");
    });

    return allowed.size > 0 ? [...allowed] : ["Question", "Illustrative object"];
  }, [compositeBlocksTypes, compositeBlocks?.type]);

  // Filter areas to show only saved objects (with blockId) of the allowed types
  const selectableAreas = useMemo(() => {
    if (!areasProperties || !Array.isArray(areasProperties)) {
      return [];
    }

    return areasProperties.map((pageAreas) => {
      if (!Array.isArray(pageAreas)) return [];

      return pageAreas.filter(
        (area) => area.blockId && allowedAreaTypes.includes(area.type)
      );
    });
  }, [areasProperties, allowedAreaTypes]);

  // Map blockId → color for blocks that already have a type chosen
  const blockColorMap = useMemo(() => {
    const map = {};
    compositeBlocks?.areas?.forEach((area) => {
      if (area.text && area.color) {
        map[area.text] = area.color; // area.text stores the blockId
      }
    });
    return map;
  }, [compositeBlocks]);

  // Set of blockIds added to composite blocks regardless of whether a type was chosen
  const addedBlockIds = useMemo(() => {
    const set = new Set();
    compositeBlocks?.areas?.forEach((area) => {
      if (area.text) set.add(area.text);
    });
    return set;
  }, [compositeBlocks]);

  // Three visual states:
  //   typed (has color)  → random color  (solid colored border)
  //   added, no type     → "" empty      (dashed border via getBlockStyle)
  //   not added          → "#808080"     (grey solid border)
  const displayAreas = useMemo(() => {
    return selectableAreas.map((pageAreas) =>
      pageAreas.map((area) => ({
        ...area,
        color: blockColorMap[area.blockId]
          ?? (addedBlockIds.has(area.blockId) ? "" : "#808080"),
      }))
    );
  }, [selectableAreas, blockColorMap, addedBlockIds]);

  // Handle area click — add block to composite list with no color (color comes on type pick)
  const onAreaClick = useCallback(
    (areaProps) => {
      const areaIndex = areaProps.areaNumber - 1;
      const area = selectableAreas[activePage]?.[areaIndex];

      if (area?.blockId && onSelectObject) {
        onSelectObject(area.blockId);
        handleCloseModal();
      }
    },
    [activePage, selectableAreas, onSelectObject, handleCloseModal]
  );

  // Handle case where data is not available
  if (!pages || !areasProperties) {
    return (
      <>
        <BootstrapModal.Header closeButton>
          <BootstrapModal.Title>Select Object</BootstrapModal.Title>
        </BootstrapModal.Header>
        <BootstrapModal.Body>
          <p>Loading pages...</p>
        </BootstrapModal.Body>
        <BootstrapModal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </BootstrapModal.Footer>
      </>
    );
  }

  return (
    <>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>Select Object</BootstrapModal.Title>
      </BootstrapModal.Header>

      <BootstrapModal.Body style={{ maxHeight: "70vh", overflow: "auto" }}>
        {/* StudioEditor in Read-Only Mode */}
        <StudioEditor
          areasProperties={displayAreas}
          setAreasProperties={() => {}} // No-op (read-only)
          activePage={activePage}
          imageScaleFactor={imageScaleFactor}
          setImageScaleFactor={setImageScaleFactor}
          areas={displayAreas}
          setAreas={() => {}} // No-op (read-only)
          onChangeHandler={() => {}} // No-op (read-only)
          pages={pages}
          onImageLoad={() => {}}
          showVB={false} // No virtual blocks in modal
          onClickImage={(pageIndex) => setActivePage(pageIndex)}
          readOnly={true} // Enable read-only mode
          onAreaClick={onAreaClick} // Click handler for area selection
          activeRightTab={{ label: "" }} // Dummy tab (not used in read-only)
          compositeBlocks={{ areas: [], type: "", name: "" }} // Dummy (not used)
          setCompositeBlocks={() => {}}
          highlight=""
          highlightedBlockId=""
          virtualBlocks={[]}
          setVirtualBlocks={() => {}}
        />
      </BootstrapModal.Body>

      <BootstrapModal.Footer>
        <Button variant="secondary" onClick={handleCloseModal}>
          Cancel
        </Button>
      </BootstrapModal.Footer>
    </>
  );
};

export default CompositeBlocksModal;
