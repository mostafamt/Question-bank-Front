import React from "react";

import styles from "./gPtInput.module.scss";
import { Button, CircularProgress, TextField } from "@mui/material";
import { toast } from "react-toastify";
import { createObjectGPT, newSaveObject } from "../../services/api";
import { useStore } from "../../store/store";
import SaveIcon from "@mui/icons-material/Save";
import { v4 as uuidv4 } from "uuid";

const GPTInput = () => {
  const { data: state, setFormState } = useStore();

  const [json, setJson] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState("");
  const [loadingSave, setLoadingSave] = React.useState(false);

  const onClickSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let parsed = "";
    try {
      parsed = JSON.parse(json);
    } catch (error) {
      console.log("error= ", error);
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

  const onClickSave = async (e) => {
    setLoadingSave(true);
    console.log("onClickSave");
    const data = {
      questionName: state.questionName || `object ${uuidv4().slice(0, 4)}`,
      objectOwner: "me",
      domainId: "ea593b9efe036879f9329e46051356af",
      subDomainId: "8922af923453305fb60e39f5c205ccdb",
      topic: "topic",
      language: "en",
      type: state.type,
      IR: "test",
      domainName: "Scube Test Domain",
      subDomainName: "Scube Test Sub Domain",
      parameters: json,
    };
    const res = await newSaveObject(data);
    toast.success("Object Saved Successfully");
    setLoadingSave(false);
  };

  return (
    <div className={styles["gpt"]}>
      <form onSubmit={onClickSubmit}>
        <TextField
          id="outlined-multiline-static"
          label="GPT"
          multiline
          rows={12}
          defaultValue=""
          fullWidth
          value={json}
          onChange={(e) => setJson(e.target.value)}
        />
        <div style={{ textAlign: "center" }}>
          <Button variant="contained" type="submit" disabled={loading}>
            {loading ? <CircularProgress size="1rem" sx={{ mr: 2 }} /> : <></>}
            Submit
          </Button>
        </div>
      </form>
      {result && (
        <div className={styles["result"]}>
          <span>{result}</span>
          <Button
            variant="contained"
            type="button"
            endIcon={
              loadingSave ? <CircularProgress size="1rem" /> : <SaveIcon />
            }
            onClick={onClickSave}
            disabled={loadingSave}
          >
            Save
          </Button>
        </div>
      )}
    </div>
  );
};

export default GPTInput;
