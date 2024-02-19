import React from "react";
import { Button, Checkbox, Input, TextField } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import { v4 as uuidv4 } from "uuid";

import styles from "./questionForm.module.scss";

const styleSheet = {
  objectName: {
    position: "relative",
    marginBottom: "2rem",
    width: "100%",
  },
  option: {
    // position: "relative",
    width: "100%",
  },
  btn: {
    display: "flex",
    gap: ".5rem",
  },
  deleteBtn: {},
  box: {
    marginTop: "4rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  treeItem: {
    ".MuiTreeItem-label": {
      fontSize: "1.4rem !important",
      padding: "1rem 0",
    },
  },
};

const QuestionForm = (props) => {
  const { question, handleEditQuestionParam } = props;

  const handleAddOption = () => {
    const newAnswers = question.answers
      ? [
          ...question?.answers,
          {
            id: uuidv4(),
            title: "",
            correct: false,
            tip: "",
            showTip: false,
          },
        ]
      : [
          {
            id: uuidv4(),
            title: "",
            correct: false,
            tip: "",
            showTip: false,
          },
        ];

    handleEditQuestionParam("answers", newAnswers);
  };

  const handleUpdateOption = (optionId, value, isCorrect, tip) => {
    const newAnswers = question.answers.map((answer) => {
      if (answer.id === optionId) {
        return {
          ...answer,
          text: value,
          correct: isCorrect,
          tip: tip,
        };
      }
      return answer;
    });
    handleEditQuestionParam("answers", newAnswers);
  };

  const handleDeleteOption = (answerId) => {
    if (question.answers.length <= 2) return;
    const newAnswers = question.answers.filter(
      (answer) => answer.id !== answerId
    );
    handleEditQuestionParam("answers", newAnswers);
  };

  const onClickTip = (optionId) => {
    const newOptions = question.options.map((option) => {
      if (option.id === optionId) {
        return {
          ...option,
          showTip: !option.showTip,
        };
      }
      return option;
    });
    handleEditQuestionParam("options", newOptions);
  };

  return (
    <div className={styles.form}>
      <TextField
        label="Question"
        variant="outlined"
        name="question"
        sx={styleSheet.objectName}
        value={question?.question}
        onChange={(e) => handleEditQuestionParam(e.target.name, e.target.value)}
      />
      <h4>options: </h4>
      <ul className={styles.options}>
        {question?.answers?.map((answer, idx) => (
          <li key={idx} className={styles.option}>
            <>
              <div>
                <div>
                  <div>
                    <TextField
                      label={`Option ${idx + 1}`}
                      name={`Option ${idx + 1}`}
                      variant="outlined"
                      sx={styleSheet.option}
                      value={answer.text}
                      InputLabelProps={{ shrink: true }}
                      onChange={(e) =>
                        handleUpdateOption(
                          answer.id,
                          e.target.value,
                          answer.correct,
                          answer.tip
                        )
                      }
                    ></TextField>
                    <button type="button" onClick={() => onClickTip(answer.id)}>
                      <InfoIcon color="primary" />
                    </button>
                    <div
                      className={styles.popover}
                      style={{
                        display: answer.showTip ? "block" : "none",
                      }}
                    >
                      <Input
                        value={answer.tip}
                        onChange={(e) =>
                          handleUpdateOption(
                            answer.id,
                            answer.text,
                            answer.correct,
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
                <Button
                  sx={styleSheet.deleteBtn}
                  variant="outlined"
                  color="primary"
                >
                  <Checkbox
                    checked={answer.correct}
                    onChange={(e) =>
                      handleUpdateOption(
                        answer.id,
                        answer.text,
                        !answer.correct,
                        answer.tip
                      )
                    }
                  />
                </Button>
                <Button
                  sx={styleSheet.deleteBtn}
                  variant="outlined"
                  color="error"
                  onClick={() => handleDeleteOption(answer.id)}
                >
                  <DeleteIcon />
                </Button>
              </div>
            </>
          </li>
        ))}
      </ul>
      <Button
        color="success"
        sx={(styleSheet.btn, { fontWeight: "bold" })}
        size="large"
        onClick={handleAddOption}
      >
        add option
      </Button>
    </div>
  );
};

export default QuestionForm;
