import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";

const Modal = (props) => {
  const { show, handleClose, children, size, fullScreen } = props;
  return (
    <BootstrapModal
      show={show}
      onHide={handleClose}
      size={size}
      fullscreen={fullScreen}
    >
      {children}
    </BootstrapModal>
  );
};

export default Modal;
