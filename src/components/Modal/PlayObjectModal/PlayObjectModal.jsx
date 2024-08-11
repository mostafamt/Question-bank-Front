import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";

import styles from "./playObjectModal.module.scss";

const PlayObjectModal = () => {
  return (
    <div>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title></BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        <div>Body</div>
      </BootstrapModal.Body>
    </div>
  );
};

export default PlayObjectModal;
