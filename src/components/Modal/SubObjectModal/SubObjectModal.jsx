import React from "react";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { AreaSelector } from "@bmunozg/react-image-area";
import ClearIcon from "@mui/icons-material/Clear";
import { useStore } from "../../../store/store";
import Grid from "@mui/material/Grid";

import { default as BootstrapModal } from "react-bootstrap/Modal";

import styles from "./subObjectModal.module.scss";
import AreaActions from "../../AreaActions/AreaActions";
import Studio from "../../Studio/Studio";
import QuestionNameHeader from "../../QuestionNameHeader/QuestionNameHeader";
import { v4 as uuidv4 } from "uuid";

const SubObjectModal = (props) => {
  const { handleClose, image, name, type, setResults, parameter, y } = props;
  const { data: state } = useStore();

  const close = () => {
    // setResults((prevState) => [...prevState]);
    const id = uuidv4();
    setResults((prevState) => [
      ...prevState,
      {
        id,
        image: image,
        parameter: parameter,
        y,
      },
    ]);
    handleClose();
  };

  return (
    <div>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>Modal heading</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        <QuestionNameHeader questionName={name} type={type} />
        <Studio
          images={[image]}
          setImages={() => ({})}
          questionName={name}
          type={type}
          subObject
          handleClose={close}
        />
      </BootstrapModal.Body>
      <BootstrapModal.Footer>
        <h1>footer</h1>
      </BootstrapModal.Footer>
    </div>
  );
};

export default SubObjectModal;
