import React from "react";
import axios from "../../axios";
import { useParams } from "react-router-dom";

import styles from "./editQuestion.module.scss";
import { Button, CircularProgress } from "@mui/material";
import SingleQuestion from "../../components/MultipleChoice/SingleQuestion/SingleQuestion";
import { toast } from "react-toastify";
import DragSingleQuestion from "../../components/DragTheWords/DragSingleQuestion/DragSingleQuestion";

const EditQuestion = () => {
  const [question, setQuestion] = React.useState();
  const [loading, setLoading] = React.useState(false);
  const params = useParams();
  const { id } = params;

  const fetchQuestion = async (id) => {
    const res = await axios.get(`/question/${id}`);
    setQuestion({
      type: res.data.type,
      params: {
        ...res.data.question,
        options: res.data.question.options.map((option) => ({
          ...option,
          showTip: false,
        })),
      },
    });
  };

  React.useEffect(() => {
    fetchQuestion(id);
  }, []);

  const handleEditQuestionParam = (param, value) => {
    const newQuestion = {
      ...question,
      params: {
        ...question.params,
        [param]: value,
      },
    };
    console.log("newQuestion= ", newQuestion);
    setQuestion(newQuestion);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const values = { question: question.params };
    // console.log("values= ", values);

    await axios.put(`/question/${id}`, values);
    setLoading(false);
    toast.success("Question updated successfully!");
  };

  return (
    <form
      className={`container ${styles["edit-question"]}`}
      onSubmit={onSubmit}
    >
      <div className={styles.header}>Multiple Choice</div>
      {question?.type === "Multiple Choice" && (
        <SingleQuestion
          question={question}
          handleEditQuestionParam={handleEditQuestionParam}
        />
      )}
      {/* {question?.type === "Drag the words" && (
        <DragSingleQuestion
          question={question}
          handleEditQuestionParam={handleEditQuestionParam}
        />
      )} */}
      <div className={styles.actions}>
        <Button
          variant="contained"
          size="large"
          type="submit"
          disabled={loading}
        >
          <span>Submit</span>
          {loading && <CircularProgress />}
        </Button>
      </div>
    </form>
  );
};

export default EditQuestion;
