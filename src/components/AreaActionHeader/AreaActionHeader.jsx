import React from "react";
import MuiSelect from "../MuiSelect/MuiSelect";

import styles from "./areaActionHeader.module.scss";
import { useLabels } from "../../utils/ocr";
import { Box } from "@mui/material";

const AreaActionHeader = (props) => {
  const {
    list,
    parameter,
    idx,
    onClickDeleteArea,
    trialArea,
    types,
    onChangeAreaItem,
    updateTrialAreas,
    onChangeLabel,
  } = props;

  const labels = useLabels(trialArea.type);

  return (
    <div className={styles["area-action-header"]}>
      <div
        className={styles.color}
        style={{
          backgroundColor: trialArea.color || "green",
        }}
      ></div>
      <Box sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <MuiSelect
            list={types}
            value={trialArea.type}
            onChange={(event) =>
              onChangeAreaItem(trialArea.id, "type", event.target.value)
            }
          />
        </div>
        <div>
          <MuiSelect
            list={labels}
            value={trialArea.label}
            onChange={(event) =>
              onChangeLabel(trialArea.id, event.target.value)
            }
          />
        </div>
      </Box>
    </div>
  );
};

export default AreaActionHeader;
