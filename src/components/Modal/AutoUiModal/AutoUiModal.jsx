import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import DrawnUI from "../../../pages/DrawnUI/DrawnUI";

// // id, type, fromOCR
const AutoUiModal = (props) => {
  const { workingArea } = props;

  console.log("workingArea= ", workingArea);

  return (
    <div>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title></BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        <DrawnUI
          type={workingArea.label}
          id={workingArea.text}
          fromOCR={true}
        />
      </BootstrapModal.Body>
    </div>
  );
};

export default AutoUiModal;
