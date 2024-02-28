import React from "react";
import { Button, Input, TextField } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import { v4 as uuidv4 } from "uuid";
import axios from "../../../axios";
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
    if (question.answers.length <= 1) return;
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
  const handleShowObject = async () => {
    try {
      const {data} = await axios.get(
        "http://localhost:4000/api/createObject/65ccf38d2bc7f5003417ccec"
      );
      
      window.open(data)
      // Handle the response data as needed
    } catch (error) {
      console.error("Error fetching object:", error);
    }
  };
  return (
    <div className={styles.form}>
      <TextField
        label="Question"
        variant="outlined"
        name="title"
        sx={styleSheet.objectName}
        value={question?.questions||question.title}
        onChange={(e) => handleEditQuestionParam(e.target.name, e.target.value)}
      />
      <h4>Correct Answer: </h4>
      <ul className={styles.options}>
        {question?.answers?.map((answer, idx) => (
          <li key={idx} className={styles?.option}>
            <>
              <div>
                <div>
                  <div>
                    <TextField
                      label={`correct answer ${idx + 1}`}
                      variant="outlined"
                      sx={styleSheet.option}
                      value={answer?.text}
                      onChange={(e) =>
                        handleUpdateOption(
                          answer.id,
                          e.target.value,
                          answer.correct,
                          answer.tip
                        )
                      }
                    ></TextField>
                    <button type="button" onClick={() => onClickTip(answer?.id)}>
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
        add correct answer
      </Button>
      <Button
        color="primary"
        sx={(styleSheet.btn, { fontWeight: "bold" })}
        size="large"
        onClick={handleShowObject} // Call the handleShowObject function when the button is clicked
      >
        Show Object
      </Button>
      
    </div>
  );
};

export default QuestionForm;
