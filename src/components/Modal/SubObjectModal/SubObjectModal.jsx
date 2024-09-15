import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import Studio from "../../Studio/Studio";
import QuestionNameHeader from "../../QuestionNameHeader/QuestionNameHeader";

import styles from "./subObjectModal.module.scss";
import { saveObject } from "../../../services/api";
import { uploadBase64 } from "../../../utils/upload";

const SubObjectModal = (props) => {
  const {
    handleClose,
    image,
    name,
    type,
    results,
    setSubTypeObjects,
    // handleSubmit,
    updateTrialAreas,
  } = props;

  const handleSubmit = async (questionName, type, areas) => {
    const objectElements = await Promise.all(
      [...areas]
        .sort((a, b) => a.order - b.order)
        .map(async (item) => ({
          [item.label]:
            item.type === "image" ? await uploadBase64(item.image) : item.text,
        }))
    );

    const data = {
      questionName: "question",
      language: "en",
      domainId: "2711ca97c3a47af8c82925e8cd233d0e",
      domainName: "Science",
      subDomainId: "d7c8da80d67227affcb50494c1a9cfa7",
      subDomainName: "Chemistry",
      topic: "topic",
      objectOwner: "me",
      type,
      objectElements,
    };

    const id = await saveObject(data);
    return id;
  };

  return (
    <div>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title></BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        {/* <QuestionNameHeader subObject /> */}
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
          types={[type]}
        />
      </BootstrapModal.Body>
      <BootstrapModal.Footer></BootstrapModal.Footer>
    </div>
  );
};

export default SubObjectModal;
