import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";

const Modal = (props) => {
  const { show, handleClose, children } = props;
  return (
    <BootstrapModal show={show} onHide={handleClose}>
      {children}
    </BootstrapModal>
  );
};

export default Modal;
