import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import { Box, Button } from "@mui/material";
import RadioQuestionsTable from "../../Tables/RadioQuestionsTable/RadioQuestionsTable";
import { useStore } from "../../../store/store";

const ObjectsTableModalContent2 = (props) => {
  const { handleCloseModal, virtualBlocks, setVirtualBlocks } = props;

  const { data: state } = useStore();

  const [object, setObject] = React.useState(
    virtualBlocks[state.virtual_block_label]
  );

  const onSubmit = (event) => {
    event.preventDefault();
    setVirtualBlocks({
      ...virtualBlocks,
      [state.virtual_block_key]: {
        ...virtualBlocks[state.virtual_block_key],
        label: virtualBlocks[state.virtual_block_key]?.label,
        id: object,
      },
    });
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
