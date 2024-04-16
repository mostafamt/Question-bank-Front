import React from "react";
import { useStore } from "../../store/store";
import Modal from "../Modal/Modal";
import EditObjectModal from "../Modal/EditObjectModal/EditObjectModal";
import EditIcon from "@mui/icons-material/Edit";

import styles from "./questionNameHeader.module.scss";
import { IconButton } from "@mui/material";

const QuestionNameHeader = (props) => {
  const [show, setShow] = React.useState(false);
  const { questionName, type } = props;

  const toggleShow = () => {
    setShow((prevState) => !prevState);
  };

  const { data: state } = useStore();

  return (
    <div>
      <Modal show={show} handleClose={toggleShow}>
        <EditObjectModal handleClose={toggleShow} />
      </Modal>
      <div className={styles.header}>
        <div>
          <span>Name: </span>
          <span>{questionName || state?.questionName}</span>
        </div>
        <div>
          <span>Type: </span>
          <span>{type || state?.type}</span>
        </div>
        <div>
          <IconButton aria-label="edit" color="white" onClick={toggleShow}>
            <EditIcon />
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export default QuestionNameHeader;
