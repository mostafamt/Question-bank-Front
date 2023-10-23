import React from "react";
import QuestionForm from "../../MultipleChoice/QuestionForm/QuestionForm";

import styles from "./multipleChoiceForm.module.scss";

const MultipleChoiceForm = (props) => {
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

export default MultipleChoiceForm;
