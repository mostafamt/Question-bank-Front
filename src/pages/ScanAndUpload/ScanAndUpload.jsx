import React from "react";
import Button from "@mui/material/Button";
import axios from "axios";
import Loader from "../../components/Loader/Loader";
import Studio from "../../components/Studio/Studio";
import { convertPdfToImages } from "../../utils/server";
import QuestionNameHeader from "../../components/QuestionNameHeader/QuestionNameHeader";
import { useStore } from "../../store/store";
import DescriptionIcon from "@mui/icons-material/Description";
import CollectionsIcon from "@mui/icons-material/Collections";
import VisuallyHiddenInput from "../../components/VisuallyHiddenInput/VisuallyHiddenInput";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { getAllTypes } from "../../services/api";
import ObjectType from "../../components/ObjectType/ObjectType";

import styles from "./scanAndUpload.module.scss";
import { CircularProgress, TextField } from "@mui/material";
import GPTInput from "../../components/GPTInput/GPTInput";

const ScanAndUpload = () => {
  const location = useLocation();
  const [images, setImages] = React.useState(location.state?.images || []);
  const [loading, setLoading] = React.useState(false);

  const { data: state, setFormState } = useStore();
  const { questionName, type } = state;

  const getTypes = async () => {
    const res = await getAllTypes();
    setFormState({ ...state, types: res, language: "en" });
  };

  React.useEffect(() => {
    getTypes();
  }, []);

  const onChangeImages = async (event) => {
    const files = event.target.files;
    const urls = [...files].map((file) => URL.createObjectURL(file));
    setImages(urls);
  };

  return (
    <div className={`container ${styles["scan-and-upload"]}`}>
      <QuestionNameHeader name={questionName} type={type} />
      {!!images.length ? (
        <Studio
          images={images}
          setImages={setImages}
          questionName={state.questionName}
          type={state.type}
        />
      ) : (
        <>
          <ObjectType />
          <div className={styles["upload-buttons"]}>
            <div className={styles["upload"]}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CollectionsIcon />}
                onChange={onChangeImages}
                color="success"
                disabled={type ? false : true}
              >
                Upload images
                <VisuallyHiddenInput
                  type="file"
                  accept="image/png, image/jpeg"
                  multiple
                />
              </Button>
            </div>
            <GPTInput type={state.type} />
          </div>
        </>
      )}
    </div>
  );
};

export default ScanAndUpload;
