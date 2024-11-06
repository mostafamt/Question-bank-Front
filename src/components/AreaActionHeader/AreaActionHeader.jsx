import React from "react";
import MuiSelect from "../MuiSelect/MuiSelect";

import styles from "./areaActionHeader.module.scss";
import { getLabels } from "../../utils/ocr";
import { Box } from "@mui/material";

const AreaActionHeader = (props) => {
  const {
    trialArea,
    types,
    onChangeLabel,
    subObject,
    type,
    updateAreaProperty,
    updateAreaPropertyById,
    typeOfActiveType,
  } = props;

  const labels = getLabels(
    types,
    subObject ? typeOfActiveType : trialArea.type
  );

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
            list={
              subObject
                ? [type]
                : types
                    ?.filter((item) => item.typeCategory === "B")
                    .map((item) => item.typeName)
            }
            value={trialArea.type}
            onChange={(event) =>
              updateAreaPropertyById(trialArea.id, {
                type: event.target.value,
              })
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
