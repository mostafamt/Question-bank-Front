import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import Studio from "../../Studio/Studio";
import SubObjectHeader from "../../SubObjectHeader/SubObjectHeader";
import { v4 as uuidv4 } from "uuid";

import styles from "./subObjectModal.module.scss";

const SubObjectModal = (props) => {
  const {
    handleClose,
    image,
    // type,
    setSubTypeObjects,
    handleSubmit,
    updateTrialAreas,
  } = props;

  const [name, setName] = React.useState(`object ${uuidv4().slice(0, 4)}`);
  const [type, setType] = React.useState("");
  // *InteractiveObject
  console.log("type= ", type);

  return (
    <div>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title></BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        <SubObjectHeader
          name={name}
          setName={setName}
          type={type}
          setType={setType}
        />
        <Studio
          images={[image]}
          setImages={() => ({})}
          type={type}
          handleClose={handleClose}
          subObject
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
