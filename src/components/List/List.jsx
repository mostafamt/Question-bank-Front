import React from "react";
import { Link } from "react-router-dom";
import styles from "./list.module.scss";
import { BACKEND_URL } from "../../config/config";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DeleteIcon from "@mui/icons-material/Delete";
import { Button } from "@mui/material";
import Table from "../Table/Table";

const List = () => {
  const [questions, setQuestions] = React.useState([]);
  const [loadingQuestions, setLoadingQuestions] = React.useState(false);

  const fetchQuestions = React.useCallback(async () => {
    setLoadingQuestions(true);
    const res = await fetch(`${BACKEND_URL}/list`);
    const data = await res.json();
    setQuestions(data);
    setLoadingQuestions(false);
  }, []);

  React.useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const clickDeleteButtonHandler = async (event, id) => {
    event.preventDefault();
    const result = window.confirm("Are you sure to delete ?");
    if (result) {
      await fetch(`${BACKEND_URL}/question?id=${id}`, {
        method: "DELETE",
      });
      setQuestions((prevState) =>
        prevState.filter((question) => question.id !== id)
      );
    }
  };

  const renderQuestionList = (
    <div className={styles.questionList}>
      {loadingQuestions ? (
        <div>Loading...</div>
      ) : (
        <ul>
          <li>
            <div className={`${styles.row} ${styles.header}`}>
              <span>Question Name</span>
              <span>Question Type</span>
              <span>Actions</span>
            </div>
          </li>
          {questions.length ? (
            questions.map((question, idx) => {
              return (
                <li key={idx}>
                  <Link to={`/show/${question._id}`} className={styles.row}>
                    <span>{question.name}</span>
                    <span>{question.type.toUpperCase()}</span>
                    <span className={styles.actions}>
                      <Button
                        className={styles["show-button"]}
                        variant="outlined"
                        color="primary"
                      >
                        <PlayArrowIcon color="primary" />
                      </Button>
                      <Button
                        className={styles["delete-button"]}
                        color="error"
                        variant="outlined"
                        onClick={(e) =>
                          clickDeleteButtonHandler(e, question.id)
                        }
                      >
                        <DeleteIcon color="error" />
                      </Button>
                    </span>
                  </Link>
                </li>
              );
            })
          ) : (
            <li>
              <div>There is no questions yet! You can create one. </div>
            </li>
          )}
        </ul>
      )}
    </div>
  );

  return (
    <div className={`container  ${styles.list}`}>
      <div className={styles.questionType}>
        <p>Select a question type: </p>
        <ul>
          <li>
            <Link className={styles.item} to="/true-false">
              <div className={styles.box}>
                <img src="/assets/true-false.png" alt="true-false" />
              </div>
              <p>True/False Question</p>
              <p>Create True/False questions</p>
            </Link>
          </li>
          <li>
            <Link className={styles.item} to="/fill-blank">
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
            <Link className={styles.item} to="/multiple-choice">
              <div className={styles.box}>
                <img src="/assets/multichoice.png" alt="multichoice" />
              </div>
              <p>Multiple Choice</p>
              <p>Create flexible multiple choice questions</p>
            </Link>
          </li>
        </ul>
      </div>
      {renderQuestionList}
      <Table questions={questions} />
    </div>
  );
};

export default List;
