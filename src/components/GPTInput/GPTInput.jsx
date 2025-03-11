import React from "react";

import styles from "./gPtInput.module.scss";
import { Button, CircularProgress, TextField } from "@mui/material";
import { toast } from "react-toastify";
import { createObjectGPT } from "../../services/api";
import { useStore } from "../../store/store";

const GPTInput = () => {
  const { data: state, setFormState } = useStore();

  const [json, setJson] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState("");

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
      <div>{result}</div>
    </div>
  );
};

export default GPTInput;
