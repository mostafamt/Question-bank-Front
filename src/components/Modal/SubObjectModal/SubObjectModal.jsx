import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import Studio from "../../Studio/Studio";
import QuestionNameHeader from "../../QuestionNameHeader/QuestionNameHeader";

import styles from "./subObjectModal.module.scss";

const SubObjectModal = (props) => {
  const {
    handleClose,
    image,
    name,
    type,
    results,
    setSubTypeObjects,
    handleSubmit,
    updateTrialAreas,
  } = props;

  return (
    <div>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title></BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        <QuestionNameHeader subObject />
        <Studio
          images={[image]}
          setImages={() => ({})}
          name={name}
          type={type}
          handleClose={handleClose}
          subObject
          results={results}
          setSubTypeObjects={setSubTypeObjects}
          handleSubmit={handleSubmit}
          updateTrialAreas={updateTrialAreas}
        />
      </BootstrapModal.Body>
      <BootstrapModal.Footer></BootstrapModal.Footer>
    </div>
  );
};

export default SubObjectModal;
