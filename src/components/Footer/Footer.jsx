import React from "react";
import styles from "./footer.module.scss";

const Footer = () => {
  return (
    <footer>
      {/* <div className={styles["logo-box"]}>
        <img src="/assets/logo.png" alt="logo" />
      </div> */}
      <div>All rights reserved &copy; {new Date().getFullYear()}</div>
    </footer>
  );
};

export default Footer;
