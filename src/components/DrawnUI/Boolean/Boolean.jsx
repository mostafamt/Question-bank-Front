import React from "react";
import { Checkbox, FormControlLabel } from "@mui/material";
import { Controller } from "react-hook-form";
import ValidationMessage from "../../ValidationMessage/ValidationMessage";

const Boolean = (props) => {
  const { control, path, errors, required, getValues, setValue, name, label } =
    props;

  const onChange = (e) => {
    const check = e.target.checked;
    setValue(name, check);
  };

  return (
    <div style={{ marginBottom: "1rem" }}>
      <Controller
        name={name}
        control={control}
        rules={{ required }} // Set required rule
        // defaultValue="false"
        render={({ field }) => (
          <FormControlLabel
            control={
              <Checkbox
                name={name}
                value={field.value}
                checked={field.value}
                onChange={onChange}
              />
            }
            label={label}
          />
        )}
      />
      <ValidationMessage path={path} errors={errors} />
    </div>
  );
};

export default Boolean;
