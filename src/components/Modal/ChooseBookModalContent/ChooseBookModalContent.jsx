import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import AddBook from "../../../pages/AddBook/AddBook";

const ChooseBookModalContent = ({ onImport }) => {
  return (
    <div>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>Import Chapter Images</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        <AddBook onImport={onImport} isModal={true} />
      </BootstrapModal.Body>
      <BootstrapModal.Footer>
        <small className="text-muted">
          Select a book and chapter, then click import
        </small>
      </BootstrapModal.Footer>
    </div>
  );
};

export default ChooseBookModalContent;
