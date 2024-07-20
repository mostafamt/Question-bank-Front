import React from "react";
import AreaAction from "../AreaAction/AreaAction";
import { Button, CircularProgress, IconButton, TextField } from "@mui/material";

const AreaActions = (props) => {
  const {
    parameters,
    boxColors,
    onChangeParameter,
    loading,
    extractedTextList,
    onEditText,
    onClickDeleteArea,
    type,
    onClickSubmit,
    loadingSubmit,
    areas,
  } = props;

  return (
    <>
      {areas.map((area, idx) => (
        <AreaAction
          key={idx}
          color={boxColors[idx]}
          parameter={parameters[idx]}
          onChangeParameter={onChangeParameter}
          idx={idx}
          onClickDeleteArea={onClickDeleteArea}
          extractedTextList={extractedTextList}
          onEditText={onEditText}
          type={type}
        />
      ))}

      {extractedTextList.length > 0 && (
        <div>
          <Button
            variant="contained"
            onClick={onClickSubmit}
            sx={{ width: "100%" }}
            disabled={loadingSubmit}
            startIcon={loadingSubmit ? <CircularProgress size="1rem" /> : <></>}
          >
            Submit
          </Button>
        </div>
      )}
      <div>Num of areas: {areas.length}</div>
    </>
  );
};

export default AreaActions;
