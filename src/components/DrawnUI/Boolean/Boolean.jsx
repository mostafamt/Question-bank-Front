import React from "react";
import { Checkbox } from "@mui/material";
import { Controller } from "react-hook-form";
import ValidationMessage from "../../ValidationMessage/ValidationMessage";

const Boolean = (props) => {
  const { control, path, errors, required, getValues, setValue, name } = props;

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
          <div>
            {console.log("field= ", field)}
            <input
              type="checkbox"
              // {...field}
              name={name}
              value={field.value}
              checked={field.value}
              onChange={onChange}
            />
            {"  "}
            <label htmlFor={name}>Correct</label>
          </div>
        )}
      />
      <ValidationMessage path={path} errors={errors} />
    </div>
  );
};

export default Boolean;
