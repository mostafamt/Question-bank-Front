import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";

const EditCompositeBlocks = ({ id }) => {
  return (
    <div>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title></BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body style={{ height: "100%" }}>
        <h1>Edit Composite Blocks</h1>
        <h1>id: {id}</h1>
      </BootstrapModal.Body>
    </div>
  );
};

export default EditCompositeBlocks;
