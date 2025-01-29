import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import QuestionsTable from "../../Tables/QuestionsTable/QuestionsTable";

const ObjectsTableModalContent = (props) => {
  const { checkedObjects, setCheckedObjects } = props;

  return (
    <div>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title></BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        <QuestionsTable
          checkedObjects={checkedObjects}
          setCheckedObjects={setCheckedObjects}
        />
      </BootstrapModal.Body>
    </div>
  );
};

export default ObjectsTableModalContent;
