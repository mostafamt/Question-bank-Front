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

import styles from "./subObjectModal.module.scss";
import AreaActions from "../../AreaActions/AreaActions";

const SubObjectModal = (props) => {
  const { handleClose, type, image } = props;
  const { data: state } = useStore();

  const [labels, setLabels] = React.useState([]);
  const [areas, setAreas] = React.useState([]);
  const [parameters, setParameters] = React.useState([]);

  console.log("state= ", state);

  const getLabels = () => {
    const types = state.types;
    const selectedType = types.find((item) => item.typeName === type);
    console.log("selectedType= ", selectedType);
    return selectedType.labels;
  };

  React.useEffect(() => {
    const labs = getLabels();
    setLabels(labs);
  }, []);

  const onChangeHandler = (areas) => {
    setAreas(areas);
  };

  const onChangeParameter = (value, idx) => {
    const newParameters = new Array(idx + 1).fill(value);
    setParameters(newParameters);
  };

  return (
    <div className={styles["modal-content"]}>
      <div className={styles.header}>
        <p>{type}</p>
        <IconButton aria-label="close" onClick={handleClose}>
          <ClearIcon />
        </IconButton>
      </div>

      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={8}>
            <AreaSelector areas={areas} onChange={onChangeHandler}>
              <img src={image} alt={image} width="100%" />
            </AreaSelector>
          </Grid>
          <Grid item xs={4}>
            <div className={styles.actions}>
              {areas.map((area, idx) => (
                <AreaActions
                  key={area}
                  labels={labels}
                  parameter={parameters[idx]}
                  // color={boxColors[idx]}
                  idx={idx}
                  // boxColors={boxColors}
                  onChangeParameter={onChangeParameter}
                  // loading={loading}
                  // extractedTextList={extractedTextList}
                  // onEditText={onEditText}
                  // onClickDeleteArea={() => onClickDeleteArea(idx)}
                />
              ))}
              {/* {extractedTextList.length > 0 && (
            <div>
              <Button
                variant="contained"
                onClick={onClickSubmit}
                sx={{ width: "100%" }}
              >
                Submit
              </Button>
            </div>
          )} */}
              Num of areas: {areas.length}
            </div>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
};

export default SubObjectModal;
