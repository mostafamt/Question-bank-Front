import React from "react";
import { ARABIC, ENGLISH } from "../../utils/ocr";

import styles from "./languageSwitcher.module.scss";

const LanguageSwitcher = (props) => {
  const { language, setLanguage } = props;

  const onChangeLanguage = (event) => {
    const value = event.target.value;
    setLanguage(value);
  };

  const buttons = [
    { show: "EN", code: ENGLISH },
    { show: "AR", code: ARABIC },
  ];

  return (
    <div className={styles["language-switcher"]}>
      {buttons.map((button) => (
        <button
          key={button.code}
          value={button.code}
          onClick={onChangeLanguage}
          className={language === button.code ? styles.active : ""}
        >
          {button.show}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
