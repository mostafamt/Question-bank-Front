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
import { getOldTypes } from "../../../services/api";

const SubObjectModal = (props) => {
  const {
    handleClose,
    image,
    name,
    type,
    setResults,
    parameter,
    y,
    objectArea,
    results,
    setSubTypeObjects,
  } = props;
  const { data: state, setFormState } = useStore();

  const close = () => {
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
        <BootstrapModal.Title></BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        <QuestionNameHeader name={name} type={type} subObject />
        <Studio
          images={[image]}
          setImages={() => ({})}
          name={name}
          type={type}
          handleClose={close}
          subObject
          objectArea={objectArea}
          results={results}
          setSubTypeObjects={setSubTypeObjects}
        />
      </BootstrapModal.Body>
      <BootstrapModal.Footer></BootstrapModal.Footer>
    </div>
  );
};

export default SubObjectModal;
