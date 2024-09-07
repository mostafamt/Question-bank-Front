import React from "react";
import { Link } from "react-router-dom";
import QuestionsTable from "../../components/Tables/QuestionsTable/QuestionsTable";

import styles from "./home.module.scss";
import BooksTable from "../../components/Tables/BooksTable/BooksTable";

const Home = () => {
  return (
    <div className={`container  ${styles.home}`}>
      <QuestionsTable />
      <BooksTable />
    </div>
  );
};

export default Home;
