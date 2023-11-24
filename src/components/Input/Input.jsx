import React from "react";
import styles from "./input.module.scss";

const Input = (props) => {
  const { register, name, label, type, errors } = props;
  return (
    <label className={styles.input}>
      <span>{label}</span>
      <input type={type} {...register(name, { required: true })} />
      {errors[name] && <p>{errors[name].type}</p>}
    </label>
  );
};

export default Input;
