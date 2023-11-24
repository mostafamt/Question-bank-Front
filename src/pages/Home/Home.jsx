import React from "react";
import { Link } from "react-router-dom";
import Table from "../../components/Table/Table";

import styles from "./home.module.scss";

const Home = () => {
  return (
    <div className={`container  ${styles.home}`}>
      <div className={styles.questionType}>
        <p>Select a question type: </p>
        <ul>
          <li>
            <Link className={styles.item} to="/add-question">
              <div className={styles.box}>
                <img src="/assets/true-false.png" alt="true-false" />
              </div>
              <p>True/False Question</p>
              <p>Create True/False questions</p>
            </Link>
          </li>
          <li>
            <Link className={styles.item} to="/add-question">
              <div className={styles.box}>
                <img
                  src="/assets/fill-in-the-blanks.png"
                  alt="fill-in-the-blanks"
                />
              </div>
              <p>Fill in the Blanks</p>
              <p>Create a task with missing words in a text</p>
            </Link>
          </li>
          <li>
            <Link className={styles.item} to="/add-question">
              <div className={styles.box}>
                <img src="/assets/multichoice.png" alt="multichoice" />
              </div>
              <p>Multiple Choice</p>
              <p>Create flexible multiple choice questions</p>
            </Link>
          </li>
        </ul>
      </div>
      <Table />
    </div>
  );
};

export default Home;
