import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import { Box, Button } from "@mui/material";
import RadioQuestionsTable from "../../Tables/RadioQuestionsTable/RadioQuestionsTable";
import { useStore } from "../../../store/store";
import { CREATED, SERVER } from "../../../utils/virtual-blocks";
import { toast } from "react-toastify";

/**
 * Modal for selecting interactive objects to link with virtual blocks
 *
 * This component displays a table of interactive objects and allows the user
 * to select one to associate with a virtual block (e.g., Activity, Overview, etc.)
 *
 * @param {Object} props
 * @param {Function} props.handleCloseModal - Closes the modal
 * @param {Object} props.virtualBlocks - Current virtual blocks state (keyed by position: L1, R1, etc.)
 * @param {Function} props.setVirtualBlocks - Updates the virtual blocks state
 */
const ObjectsTableModalContent2 = (props) => {
  const { handleCloseModal, virtualBlocks, setVirtualBlocks } = props;

  console.log("ObjectsTableModalContent2 opened with:", {
    virtualBlocks,
    virtual_block_key: useStore.getState().data.virtual_block_key,
    virtual_block_label: useStore.getState().data.virtual_block_label,
  });

  const { data: state } = useStore();

  const [object, setObject] = React.useState(
    virtualBlocks[state.virtual_block_label]
  );

  /**
   * Handle form submission when user selects an interactive object
   *
   * This function updates the virtual block with:
   * - label: The block type selected by user (from state, e.g., "Activity 🏃‍♂️")
   * - id: The selected interactive object ID
   * - status: "new" for newly created blocks, or "updated" for existing server blocks
   */
  const onSubmit = (event) => {
    event.preventDefault();

    // Validation: Ensure required data is present
    if (!state.virtual_block_label) {
      console.error("Missing virtual_block_label in state");
      toast.error("Block type not specified. Please try again.");
      return;
    }

    if (!state.virtual_block_key) {
      console.error("Missing virtual_block_key in state");
      toast.error("Block position not specified. Please try again.");
      return;
    }

    if (!object) {
      toast.warning("Please select an object before submitting.");
      return;
    }

    // Get existing block if any
    const existingBlock = virtualBlocks[state.virtual_block_key];

    // Determine if updating an existing server block
    const isUpdatingServerBlock =
      existingBlock?.id && existingBlock?.status === SERVER;

    // Build updated block with correct label and status
    const updatedBlock = {
      label: state.virtual_block_label, // ✅ From state (user's selection)
      id: object, // ✅ Selected object ID
      status: isUpdatingServerBlock ? SERVER : CREATED, // ✅ Proper status
    };

    console.log("Updating virtual block:", {
      key: state.virtual_block_key,
      updatedBlock,
      isUpdate: isUpdatingServerBlock,
    });

    // Update virtualBlocks
    setVirtualBlocks({
      ...virtualBlocks,
      [state.virtual_block_key]: updatedBlock,
    });

    // Success feedback
    toast.success(`${state.virtual_block_label} linked successfully!`);

    handleCloseModal();
  };

  return (
    <div>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title></BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        <form onSubmit={onSubmit}>
          <RadioQuestionsTable object={object} setObject={setObject} />
          <Box
            sx={{ margin: "2rem 0", display: "flex", justifyContent: "center" }}
          >
            <Button variant="contained" type="submit">
              Submit
            </Button>
          </Box>
        </form>
      </BootstrapModal.Body>
    </div>
  );
};

export default ObjectsTableModalContent2;
