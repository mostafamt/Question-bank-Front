import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import QuestionsTable from "../../Tables/QuestionsTable/QuestionsTable";
import { Box, Button } from "@mui/material";
import RadioQuestionsTable from "../../Tables/RadioQuestionsTable/RadioQuestionsTable";
import { useStore } from "../../../store/store";

const ObjectsTableModalContent2 = (props) => {
  const {
    checkedObject,
    setCheckedObject,
    handleCloseModal,
    virtualBlocks,
    setVirtualBlocks,
  } = props;
  const [object, setObject] = React.useState(checkedObject);

  const { data: state, setFormState } = useStore();

  const onSubmit = (event) => {
    event.preventDefault();
    setCheckedObject(object);
    setVirtualBlocks({
      ...virtualBlocks,
      [state.virtual_block_label]: {
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
          <RadioQuestionsTable
            checkedObject={object}
            setCheckedObject={setObject}
          />
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
