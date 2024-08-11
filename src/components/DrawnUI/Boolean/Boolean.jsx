import React from "react";
import { Checkbox, FormControlLabel } from "@mui/material";
import { Controller } from "react-hook-form";
import ValidationMessage from "../../ValidationMessage/ValidationMessage";
import { fullTextTrim } from "../../../utils/data";

const Boolean = (props) => {
  const { control, path, errors, required, setValue, name, label } = props;

  const onChange = (e) => {
    const check = e.target.checked;
    setValue(name, check);
  };

  return (
    <div>
      <Controller
        name={name}
        control={control}
        rules={{ required }} // Set required rule
        // defaultValue="false"
        render={({ field }) => (
          <FormControlLabel
            control={
              <Checkbox
                label="some label"
                name={name}
                value={field.value}
                checked={field.value}
                onChange={onChange}
              />
            }
            label={fullTextTrim(label)}
          />
        )}
      />
      <ValidationMessage path={path} errors={errors} />
    </div>
  );
};

export default Boolean;
