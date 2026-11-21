import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import ModalHeader from "../ModalHeader/ModalHeader";
import DrawnUI from "../../../pages/DrawnUI/DrawnUI";

// // id, type, fromOCR
const AutoUiModal = (props) => {
  const { workingArea } = props;


  return (
    <div>
      <ModalHeader />
      <BootstrapModal.Body>
        <DrawnUI
          type={workingArea.typeOfLabel}
          id={workingArea.text}
          fromOCR={true}
        />
      </BootstrapModal.Body>
    </div>
  );
};

export default AutoUiModal;
