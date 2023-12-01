import React from "react";

import { generateOption } from "../../../utils";
import { Button, Checkbox, Input, TextField } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import DeleteIcon from "@mui/icons-material/Delete";

import styles from "./singleQuestion.module.scss";

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

const SingleQuestion = (props) => {
  const { question, handleEditQuestionParam } = props;

  const handleAddOption = () => {
    const newOptions = [...question.params.options, generateOption()];
    handleEditQuestionParam("options", newOptions);
  };

  const handleUpdateOption = (optionId, value, isCorrect, tip) => {
    const newOptions = question.params.options.map((option) => {
      if (option._id === optionId) {
        return {
          ...option,
          title: value,
          correct: isCorrect,
          tip: tip,
        };
      }
      return option;
    });
    handleEditQuestionParam("options", newOptions);
  };

  const handleDeleteOption = (optionId) => {
    if (question.params.options.length <= 2) return;
    const newOptions = question.params.options.filter(
      (option) => option.id !== optionId
    );
    handleEditQuestionParam("options", newOptions);
  };

  const onClickTip = (optionId) => {
    const newOptions = question.params.options.map((option) => {
      if (option._id === optionId) {
        return {
          ...option,
          showTip: !option.showTip,
        };
      }
      return option;
    });
    console.log("newOptions= ", newOptions);
    handleEditQuestionParam("options", newOptions);
  };

  return (
    <div className={styles.form}>
      <TextField
        label="Question"
        variant="outlined"
        name="title"
        sx={styleSheet.objectName}
        value={question?.params?.title}
        onChange={(e) => handleEditQuestionParam(e.target.name, e.target.value)}
      />
      <h4>options: </h4>
      <ul className={styles.options}>
        {question?.params?.options?.map((option, idx) => (
          <li key={idx} className={styles.option}>
            <>
              <div>
                <div>
                  <div>
                    <TextField
                      label={`Option ${idx + 1}`}
                      variant="outlined"
                      sx={styleSheet.option}
                      value={option.title}
                      onChange={(e) =>
                        handleUpdateOption(
                          option._id,
                          e.target.value,
                          option.correct,
                          option.tip
                        )
                      }
                    ></TextField>
                    <button
                      type="button"
                      onClick={() => onClickTip(option._id)}
                    >
                      <InfoIcon color="primary" />
                    </button>
                    <div
                      className={styles.popover}
                      style={{
                        display: option.showTip ? "block" : "none",
                      }}
                    >
                      <Input
                        value={option.tip}
                        onChange={(e) =>
                          handleUpdateOption(
                            option._id,
                            option.title,
                            option.correct,
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
                    checked={option.correct}
                    onChange={(e) =>
                      handleUpdateOption(
                        option.id,
                        option.title,
                        !option.correct,
                        option.tip
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

export default SingleQuestion;
