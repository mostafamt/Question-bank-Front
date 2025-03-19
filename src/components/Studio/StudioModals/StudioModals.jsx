import React from "react";

import Modal from "../../Modal/Modal";
import SubObjectModal from "../../Modal/SubObjectModal/SubObjectModal";
import { useStore } from "../../../store/store";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import { Button, CircularProgress, TextField } from "@mui/material";
import axios from "../../../axios";
import { createObjectGPT } from "../../../services/api";
import { toast } from "react-toastify";
import UploadThumbnailModal from "../../Modal/UploadThumbnailModal/UploadThumbnailModal";

const StudioModals = (props) => {
  const {
    showModal,
    handleCloseModal,
    activeImage,
    trialAreas,
    setSubTypeObjects,
    handleSubmit,
    updateTrialAreas,
    activeType,
  } = props;

  const { data: state, setFormState } = useStore();
  const { questionName } = state;

  const [json, setJson] = React.useState("");
  const [result, setResult] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const onClickSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    let parsed = "";
    try {
      parsed = JSON.parse(json);
    } catch (error) {
      toast.error(String(error));
      setLoading(false);
      return;
    }
    const parsedWithFormat = {
      type: state.type,
      parameters: parsed,
    };
    const data = await createObjectGPT(parsedWithFormat);
    if (data) {
      setResult(data?.url);
      setTimeout(() => {
        window.open(data.url, "_blank");
      }, 500);
    }
    setLoading(false);
  };

  const renderModals = () => {
    if (state.modal === "GPT") {
      return (
        <>
          <BootstrapModal.Header closeButton>
            <BootstrapModal.Title>GPT</BootstrapModal.Title>
          </BootstrapModal.Header>
          <BootstrapModal.Body>
            <form
              onSubmit={onClickSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                margin: "2rem 0",
                gap: "2rem",
                justifyContent: "center",
              }}
            >
              <TextField
                id="outlined-multiline-static"
                label="GPT"
                multiline
                rows={8}
                defaultValue=""
                fullWidth
                value={json}
                onChange={(e) => setJson(e.target.value)}
              />
              <div style={{ textAlign: "center" }}>
                <Button variant="contained" type="submit" disabled={loading}>
                  {loading ? (
                    <CircularProgress size="1rem" sx={{ mr: 2 }} />
                  ) : (
                    <></>
                  )}
                  Submit
                </Button>
              </div>
            </form>
            <div>{result}</div>
          </BootstrapModal.Body>
        </>
      );
    } else if (state.modal === "Upload Thumbnail") {
      return <UploadThumbnailModal />;
    } else {
      return (
        <SubObjectModal
          handleClose={handleCloseModal}
          image={activeImage}
          name={`${state.questionName} - ${activeType}`}
          type={activeType}
          results={trialAreas}
          setSubTypeObjects={setSubTypeObjects}
          handleSubmit={handleSubmit}
          updateTrialAreas={updateTrialAreas}
        />
      );
    }
  };

  return (
    <Modal
      show={showModal}
      handleClose={handleCloseModal}
      size={state.modalSize || "xl"}
    >
      {renderModals()}
    </Modal>
  );
};

export default StudioModals;
