import React from "react";
import { Button, Checkbox, TextField } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { generateOption } from "../../../utils";

import styles from "./questionForm.module.scss";

const styleSheet = {
  objectName: {
    position: "relative",
    marginBottom: "2rem",
    width: "100%",
  },
  option: {
    // position: "relative",
    width: "90%",
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
    const newOptions = [...question.params.options, generateOption()];
    handleEditQuestionParam(question.id, "options", newOptions);
  };

  const handleUpdateOption = (optionId, name, value, isCorrect) => {
    const newOptions = question.params.options.map((option) => {
      if (option.id === optionId) {
        return {
          ...option,
          label: value,
          value,
          isCorrect: isCorrect,
        };
      }
      return option;
    });
    handleEditQuestionParam(question.id, name, newOptions);
  };

  const handleDeleteOption = (optionId) => {
    if (question.params.options.length <= 2) return;
    const newOptions = question.params.options.filter(
      (option) => option.id !== optionId
    );
    handleEditQuestionParam(question.id, "options", newOptions);
  };

  return (
    <div className={styles.form}>
      <TextField
        label="Question"
        variant="outlined"
        name="title"
        sx={styleSheet.objectName}
        value={question.params.title}
        onChange={(e) =>
          handleEditQuestionParam(question.id, e.target.name, e.target.value)
        }
      />
      <h4>options: </h4>
      <ul className={styles.options}>
        {question?.params?.options?.map((option, idx) => (
          <li key={idx} className={styles.option}>
            <TextField
              label={`Option ${idx + 1}`}
              variant="outlined"
              name="options"
              sx={styleSheet.option}
              value={option.value}
              onChange={(e) =>
                handleUpdateOption(
                  option.id,
                  e.target.name,
                  e.target.value,
                  option.isCorrect
                )
              }
            ></TextField>
            <Button
              sx={styleSheet.deleteBtn}
              variant="outlined"
              color="primary"
            >
              <Checkbox
                checked={option.isCorrect}
                name="options"
                onChange={(e) =>
                  handleUpdateOption(
                    option.id,
                    e.target.name,
                    option.value,
                    !option.isCorrect
                  )
                }
              />
            </Button>
            <Button
              sx={styleSheet.deleteBtn}
              variant="outlined"
              color="error"
              onClick={() => handleDeleteOption(option.id)}
            >
              <DeleteIcon />
            </Button>
          </li>
        ))}
      </ul>
      <Button
        color="success"
        sx={(styleSheet.btn, { fontWeight: "bold" })}
        onClick={handleAddOption}
      >
        add option
      </Button>
    </div>
  );
};

export default QuestionForm;
