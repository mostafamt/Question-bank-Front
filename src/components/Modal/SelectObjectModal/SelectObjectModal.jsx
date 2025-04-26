import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import ObjectsTable from "../../ObjectsTable/ObjectsTable";
import { Button } from "@mui/material";

import styles from "./selectObjectModal.module.scss";

const SelectObjectModal = (props) => {
  const { selectedRowId, setSelectedRowId, onClickSelect, onClickCancel } =
    props;

  return (
    <div className={styles["select-object-modal"]}>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>Select From Library</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        <ObjectsTable
          selectedRowId={selectedRowId}
          setSelectedRowId={setSelectedRowId}
        />
      </BootstrapModal.Body>
      <BootstrapModal.Footer className={styles.footer}>
        <Button onClick={onClickCancel}>Cancel</Button>
        <Button variant="contained" onClick={onClickSelect}>
          Select
        </Button>
      </BootstrapModal.Footer>
    </div>
  );
};

export default SelectObjectModal;
