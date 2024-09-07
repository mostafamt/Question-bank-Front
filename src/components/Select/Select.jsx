import React from "react";
import styles from "./select.module.scss";
import { CircularProgress } from "@mui/material";

const Select = (props) => {
  const { children, register, name, label, errors, disabled, loading } = props;

  const renderStatus = () => {
    if (loading) {
      return <CircularProgress />;
    } else if (!children) {
      return <div>No data available...</div>;
    }
  };

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
