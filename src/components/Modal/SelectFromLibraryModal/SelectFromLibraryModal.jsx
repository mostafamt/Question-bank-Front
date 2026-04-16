import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import { Box, Button } from "@mui/material";
import RadioQuestionsTable from "../../Tables/RadioQuestionsTable/RadioQuestionsTable";

/**
 * SelectFromLibraryModal
 * Lets the user pick a single interactive object from the library.
 * Calls onSelect(objectId) on confirm, then closes.
 *
 * @param {Object}   props
 * @param {Function} props.handleCloseModal - Closes the modal (from registry)
 * @param {Function} props.onSelect         - Called with the chosen object ID
 */
const SelectFromLibraryModal = ({ handleCloseModal, onSelect }) => {
  const [selected, setSelected] = React.useState(null);

  const handleConfirm = () => {
    if (!selected) return;
    onSelect(selected);
    handleCloseModal();
  };

  return (
    <div>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>Select from Library</BootstrapModal.Title>
      </BootstrapModal.Header>

      <BootstrapModal.Body>
        <RadioQuestionsTable object={selected} setObject={setSelected} />
      </BootstrapModal.Body>

      <BootstrapModal.Footer>
        <Button variant="outlined" onClick={handleCloseModal}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={!selected}
        >
          Confirm
        </Button>
      </BootstrapModal.Footer>
    </div>
  );
};

export default SelectFromLibraryModal;
