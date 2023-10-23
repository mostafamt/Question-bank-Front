import React from "react";
import { Button, TextField } from "@mui/material";

import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import styles from "./questionForm.module.scss";

const styleSheet = {
  textField: {
    width: "100%",
  },
  radioGroup: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
  },
  radio: {
    height: "3.5rem",
  },
  iconButton: {
    height: "3.5rem",
  },
};

const QuestionForm = ({
  question,
  addAnswerHandler,
  deleteAnswerHandler,
  editQuestionHandler,
  editAnswerHandler,
  editWhichCorrectAnswerHandler,
}) => {
  return (
    <div className="container">
      <form className={styles.form}>
        <TextField
          label="Question"
          value={question.text}
          onChange={(e) => editQuestionHandler(question.id, e.target.value)}
          variant="outlined"
          sx={styleSheet.textField}
        />

        <TextField
          label="answer"
          value={question.answer}
          onChange={(e) => editAnswerHandler(question.id, e.target.value)}
          variant="outlined"
          sx={styleSheet.textField}
        />
      </form>
    </div>
  );
};

export default QuestionForm;
