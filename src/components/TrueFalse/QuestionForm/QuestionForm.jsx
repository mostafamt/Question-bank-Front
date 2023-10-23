import React from "react";
import { Button, FormControl, FormLabel, TextField } from "@mui/material";

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
  answer,
  changeAnswer,
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
        <div className={styles.option}>
          <FormControl>
            <RadioGroup
              aria-labelledby="demo-radio-buttons-group-label"
              defaultValue="female"
              name="radio-buttons-group"
              row
              value={answer}
              onChange={(e) => changeAnswer(e.target.value)}
            >
              <FormControlLabel value="true" control={<Radio />} label="True" />
              <FormControlLabel
                value="false"
                control={<Radio />}
                label="False"
              />
            </RadioGroup>
          </FormControl>
        </div>
      </form>
    </div>
  );
};

export default QuestionForm;
