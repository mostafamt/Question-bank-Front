import React from "react";
import MuiSelect from "../MuiSelect/MuiSelect";

import styles from "./areaActionHeader.module.scss";
import { getLabels } from "../../utils/ocr";
import { Box, Checkbox, FormControlLabel } from "@mui/material";
import { isDeepBlock } from "../Studio/utils";

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
        {/* Sub-object areas submit as a label->value map, which has nowhere to
            carry a per-area flag, so the control is hidden rather than shown
            with no effect. */}
        {!subObject && (
          <FormControlLabel
            label="Deep"
            onClick={(event) => event.stopPropagation()}
            control={
              <Checkbox
                size="small"
                checked={isDeepBlock(trialArea)}
                onChange={(event) =>
                  updateAreaPropertyById(trialArea.id, {
                    isDeep: event.target.checked,
                  })
                }
              />
            }
          />
        )}
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
            onItemClick={(val) => onChangeLabel(trialArea.id, val)}
          />
        </div>
      </Box>
    </div>
  );
};

export default AreaActionHeader;
