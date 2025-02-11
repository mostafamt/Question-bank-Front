import React from "react";
import styles from "./select.module.scss";
import { CircularProgress } from "@mui/material";

const Select = (props) => {
  const {
    variant,
    children,
    register,
    name,
    label,
    errors,
    disabled,
    loading,
    value,
    onChange,
  } = props;

  if (variant === "SIMPLE") {
    return (
      <label className={styles.select}>
        <span>{label}</span>
        {loading ? (
          <CircularProgress />
        ) : (
          <select value={value} onChange={onChange}>
            <option value="">--Select an option--</option>
            {children}
          </select>
        )}
      </label>
    );
  }

  return (
    <label className={styles.select}>
      <span>{label}</span>
      {loading ? (
        <CircularProgress />
      ) : (
        <select {...register(name, { required: true })} disabled={disabled}>
          <option value="">--Select an option--</option>
          {children}
        </select>
      )}
      {errors[name] && <p>{errors[name].type}</p>}
    </label>
  );
};

export default Select;
