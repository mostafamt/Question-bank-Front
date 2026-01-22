import React, { useState, useMemo, useCallback } from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import { Button } from "react-bootstrap";
import StudioEditor from "../../Studio/StudioEditor/StudioEditor";
import ImageActions from "../../ImageActions/ImageActions";

const CompositeBlocksModal = (props) => {
  const {
    handleCloseModal,
    compositeBlockAreaId, // Composite block area ID being edited
    onSelectObject, // Callback when object is selected
    pages, // Book pages with image URLs
    areasProperties, // Existing areas on all pages
  } = props;

  // State for page navigation and zoom
  const [activePage, setActivePage] = useState(0);
  const [imageScaleFactor, setImageScaleFactor] = useState(1);

  // Filter areas to show only saved objects (with blockId)
  const selectableAreas = useMemo(() => {
    if (!areasProperties || !Array.isArray(areasProperties)) {
      return [];
    }

    return areasProperties.map((pageAreas) => {
      if (!Array.isArray(pageAreas)) return [];

      return pageAreas.filter(
        (area) =>
          area.blockId && // Must have server blockId
          (area.type === "Question" || area.type === "Illustrative object")
      );
    });
  }, [areasProperties]);

  // Handle area click - capture blockId and close modal
  const onAreaClick = useCallback(
    (areaProps) => {
      const areaIndex = areaProps.areaNumber - 1;
      const area = selectableAreas[activePage]?.[areaIndex];

      if (area?.blockId && onSelectObject) {
        onSelectObject(area.blockId); // Callback to parent
        handleCloseModal(); // Close modal
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
          areasProperties={selectableAreas}
          setAreasProperties={() => {}} // No-op (read-only)
          activePage={activePage}
          imageScaleFactor={imageScaleFactor}
          setImageScaleFactor={setImageScaleFactor}
          areas={selectableAreas}
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
