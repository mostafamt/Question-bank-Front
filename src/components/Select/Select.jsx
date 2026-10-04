import React from "react";
import styles from "./select.module.scss";
import { CircularProgress } from "@mui/material";

const Select = (props) => {
  const { children, register, name, label, errors, disabled, loading, value, onChange } = props;

  const inputProps = register
    ? register(name, { required: true })
    : { name, value, onChange };

  return (
    <label className={styles.select}>
      <span>{label}</span>
      {loading ? (
        <CircularProgress />
      ) : (
        <select {...inputProps} disabled={disabled}>
          <option value="">--Select an option--</option>
          {children}
        </select>
      )}
      {errors?.[name] && <p>{errors[name].type}</p>}
    </label>
  );
};

export default Select;
