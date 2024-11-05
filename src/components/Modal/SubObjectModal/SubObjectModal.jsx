import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import Studio from "../../Studio/Studio";
import QuestionNameHeader from "../../QuestionNameHeader/QuestionNameHeader";

import styles from "./subObjectModal.module.scss";
import { saveObject } from "../../../services/api";
import { uploadBase64 } from "../../../utils/upload";
import { instructionalRoles } from "../../../utils/ocr";
import { v4 as uuidv4 } from "uuid";

const SubObjectModal = (props) => {
  const { handleClose, image, type, types, updateAreaProperty } = props;

  const [name, setName] = React.useState(`Question - ${uuidv4()}`);
  const [instructionalRole, setInstructionalRole] = React.useState(
    instructionalRoles[0]
  );

  const handleSubmit = async (areas) => {
    const objectElements = await Promise.all(
      [...areas]
        .sort((a, b) => a.order - b.order)
        .map(async (item) => ({
          [item.label]:
            item.typeOfLabel === "image"
              ? await uploadBase64(item.image)
              : item.text,
        }))
    );

    const data = {
      questionName: name,
      instructionalRole: instructionalRole,
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
        <QuestionNameHeader
          subObject
          name={name}
          setName={setName}
          instructionalRoles={instructionalRoles}
          instructionalRole={instructionalRole}
          setInstructionalRole={setInstructionalRole}
          type={type}
        />
        <Studio
          types={types}
          pages={[{ _id: uuidv4(), url: image, blocks: [] }]}
          type={type}
          images={[image]}
          handleSubmit={handleSubmit}
          handleClose={handleClose}
          subObject
          updateAreaProperty={updateAreaProperty}
        />
      </BootstrapModal.Body>
      <BootstrapModal.Footer></BootstrapModal.Footer>
    </div>
  );
};

export default SubObjectModal;
