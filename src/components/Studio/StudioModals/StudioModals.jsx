import React from "react";

import Modal from "../../Modal/Modal";
import SubObjectModal from "../../Modal/SubObjectModal/SubObjectModal";
import { useStore } from "../../../store/store";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import { Button, TextField } from "@mui/material";
import axios from "../../../axios";
import { createObjectGPT } from "../../../services/api";

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

  const onClickSubmit = async (e) => {
    e.preventDefault();
    const data = await createObjectGPT(JSON.parse(json));
    console.log(data);
    setResult(data.url);
    setTimeout(() => {
      window.open(data.url, "_blank").focus();
    }, 2000);
  };

  return (
    <Modal show={showModal} handleClose={handleCloseModal} size="xl">
      {state.modal === "GPT" ? (
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
                <Button variant="contained" type="submit">
                  Submit
                </Button>
              </div>
            </form>
            <div>{result}</div>
          </BootstrapModal.Body>
        </>
      ) : (
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
      )}
    </Modal>
  );
};

export default StudioModals;
