import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import QuestionsTable from "../../Tables/QuestionsTable/QuestionsTable";
import { Box, Button } from "@mui/material";

const ObjectsTableModalContent = (props) => {
  const { checkedObjects, setCheckedObjects, handleCloseModal } = props;
  const [objects, setObjects] = React.useState(checkedObjects || []);

  const onSubmit = (event) => {
    event.preventDefault();
    setCheckedObjects(objects);
    handleCloseModal();
  };

  return (
    <div>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title></BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        <form onSubmit={onSubmit}>
          <QuestionsTable
            checkedObjects={objects}
            setCheckedObjects={setObjects}
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

export default ObjectsTableModalContent;
