import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";

const Modal = (props) => {
  const { show, handleClose, children, size } = props;
  return (
    <BootstrapModal show={show} onHide={handleClose} size={size}>
      {children}
    </BootstrapModal>
  );
};

export default Modal;
