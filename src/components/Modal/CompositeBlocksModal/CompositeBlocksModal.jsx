import React, { useState, useMemo, useCallback } from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import ModalHeader from "../ModalHeader/ModalHeader";
import { Button } from "react-bootstrap";
import StudioEditor from "../../Studio/StudioEditor/StudioEditor";
import { getAllowedAreaTypes } from "../../../utils/studio";

const CompositeBlocksModal = (props) => {
  const {
    handleCloseModal,
    onSelectObject, // Callback when object is selected
    compositeBlocks, // Current composite blocks — used to reflect type-assigned colors
    compositeBlocksTypes, // Full type definitions from API
    pages, // Book pages with image URLs
    areasProperties, // Existing areas on all pages
    isFullscreen,
  } = props;

  // State for page navigation and zoom
  const [activePage, setActivePage] = useState(0);
  const [imageScaleFactor, setImageScaleFactor] = useState(1);

  // Determine which area types are selectable based on composite block type's labels
  const allowedAreaTypes = useMemo(
    () => getAllowedAreaTypes(compositeBlocksTypes, compositeBlocks?.type),
    [compositeBlocksTypes, compositeBlocks?.type]
  );

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
      if (area.blockId && area.color) {
        map[area.blockId] = area.color;
      }
    });
    return map;
  }, [compositeBlocks]);

  // Set of blockIds added to composite blocks regardless of whether a type was chosen
  const addedBlockIds = useMemo(() => {
    const set = new Set();
    compositeBlocks?.areas?.forEach((area) => {
      if (area.blockId) set.add(area.blockId);
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
        // areasProperties keep the server's percentage coordinates without a
        // unit, and getBlockStyle would otherwise read them as px
        unit: "%",
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
        <ModalHeader>Select Object</ModalHeader>
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
      <ModalHeader>Select Object</ModalHeader>

      <BootstrapModal.Body
        style={isFullscreen ? undefined : { maxHeight: "70vh", overflow: "auto" }}
      >
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
          showBlocksStyling={true} // Draw the pickable blocks' borders/fill
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
