import React from "react";
import { Checkbox } from "@mui/material";
import { Controller } from "react-hook-form";
import ValidationMessage from "../../ValidationMessage/ValidationMessage";

const label = { inputProps: { "aria-label": "Checkbox demo" } };

const Boolean = (props) => {
  const {
    register,
    value,
    control,
    path,
    errors,
    required,
    getValues,
    setValue,
    param,
  } = props;

  const onChange = (e) => {
    const check = e.target.checked;
    setValue(param, check);
  };

  return (
    <div style={{ marginBottom: "1rem" }}>
      <Controller
        name={value}
        control={control}
        rules={{ required }} // Set required rule
        // defaultValue="false"
        render={({ field }) => (
          <div>
            {console.log("field= ", field)}
            <input
              type="checkbox"
              // {...field}
              value={field.value}
              checked={field.value}
              onChange={onChange}
            />
            {"  "}
            <label htmlFor={value}>Correct</label>
          </div>
        )}
      />
      <ValidationMessage path={path} errors={errors} />
    </div>
  );
};

export default Boolean;
