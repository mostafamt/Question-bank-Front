import React from "react";
import QuestionForm from "../../FillBlank/QuestionForm/QuestionForm";

import styles from "./fillBlank.module.scss";

const FillBlank = (props) => {
  const { question, handleEditQuestionParam } = props;
  return (
    <>
      <div className={styles["image-box"]}>
        <img src="/assets/question-bg-2.jpg" alt="question background" />
      </div>
      <QuestionForm
        question={question}
        handleEditQuestionParam={handleEditQuestionParam}
      />
    </>
  );
};

export default FillBlank;
