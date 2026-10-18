import React from "react";
import { Link } from "react-router-dom";
import Table from "../../components/Table/Table";

import styles from "./home.module.scss";

const Home = () => {
  return (
    <div className={`container  ${styles.home}`}>
      <Table />
    </div>
  );
};

export default Home;
