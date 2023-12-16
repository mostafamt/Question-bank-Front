import React from "react";
import { Box, Button, TextField } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddIcon from "@mui/icons-material/Add";

import TreeItem from "@mui/lab/TreeItem";

import { v4 as uuidv4 } from "uuid";

import styles from "./multipleChoice.module.scss";
// import { BACKEND_URL } from "../../config/config";
import { useNavigate } from "react-router-dom";
import { TreeView } from "@mui/lab";
import QuestionForm from "./QuestionForm/QuestionForm";
import AvailableQuestionCreationMethod from "./UploadMethods/UploadMethods";
import Questions from "./Questions/Questions";
import UploadMethods from "./UploadMethods/UploadMethods";
import { upload } from "@testing-library/user-event/dist/upload";
import Bulk from "./Bulk/Bulk";

const styleSheet = {
  objectName: {
    position: "relative",
    marginBottom: "2rem",
    width: "100%",
  },
  treeItem: {
    ".MuiTreeItem-label": {
      fontSize: "1.4rem !important",
      padding: "1rem 0",
    },
  },
  box: {
    marginTop: "4rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

const generateOption = () => {
  const id = uuidv4();
  return {
    id: uuidv4(),
    text: `Option ${id}`.slice(0, 9),
    correct: false,
  };
};

const generateQuestion = () => {
  return {
    id: uuidv4(),
    title: "Question title",
    options: [generateOption()],
  };
};

const MultipleChoice = () => {
  const navigate = useNavigate();

  const [uploadMethod, setUploadMethod] = React.useState("manual");
  const [file, setFile] = React.useState(null);
  const [name, setName] = React.useState(`Object Name`);
  const [questions, setQuestions] = React.useState([generateQuestion()]);
  const [title, setTitle] = React.useState("Question Title");
  const [options, setOptions] = React.useState([
    {
      id: uuidv4(),
      text: "Option 1",
      checked: false,
    },
  ]);

  const changeUploadMethod = (value) => {
    setUploadMethod(value);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    console.log(file);
    setFile(file);
  };

  const onAddQuestion = () => {
    setQuestions((prevState) => [...prevState, generateQuestion()]);
  };

  const updateQuestionTitle = (questionId, title) => {
    const newQuestions = questions.map((question) => {
      if (question.id === questionId) {
        return {
          ...question,
          title: title,
        };
      }
      return question;
    });
    setQuestions(newQuestions);
  };

  const addOption = (id) => {
    const newQuestions = questions.map((question) => {
      if (question.id === id) {
        question.options.push(generateOption(question.options.length + 1));
        return question;
      }
      return question;
    });
    setQuestions(newQuestions);
  };

  const updateOption = (questionId, optionId, text, checked) => {
    const newQuestions = questions.map((question) => {
      if (question.id === questionId) {
        const newOptions = question.options.map((option) => {
          if (option.id === optionId) {
            return {
              ...option,
              text: text,
              correct: checked,
            };
          }
          return option;
        });
        return { ...question, options: [...newOptions] };
      }
      return question;
    });
    setQuestions(newQuestions);
  };

  const deleteOption = (questionId, optionId) => {
    const newQuestions = questions.map((question) => {
      if (question.id === questionId) {
        const newOptions = question.options.filter(
          (option) => option.id !== optionId
        );
        return { ...question, options: [...newOptions] };
      }
      return question;
    });
    setQuestions(newQuestions);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    console.log("questions= ", questions);
    // if (uploadMethod === "bulk") {
    //   const data = new FormData();
    //   data.append("file", file);
    //   await fetch(`${BACKEND_URL}/upload`, {
    //     method: "POST",
    //     body: data,
    //   });
    // } else {
    //   const questionsWithoutIds = questions.map((question) => {
    //     const newOptions = question.options.map((option) => ({
    //       title: option.text,
    //       correct: option.correct,
    //     }));
    //     return {
    //       title: question.title,
    //       options: newOptions,
    //     };
    //   });
    //   const body = {
    //     name,
    //     questions: questionsWithoutIds,
    //   };
    //   await fetch(`${BACKEND_URL}/mcq`, {
    //     method: "POST",
    //     mode: "cors",
    //     cache: "no-cache",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(body),
    //   });
    // }
    // navigate("/");
  };

  return (
    <div className={`container ${styles["multiple-choice"]}`}>
      <UploadMethods
        uploadMethod={uploadMethod}
        changeUploadMethod={changeUploadMethod}
      />
      <form onSubmit={onSubmitHandler}>
        {uploadMethod === "manual" ? (
          <>
            <TextField
              label="Object Name"
              variant="outlined"
              sx={styleSheet.objectName}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Questions
              questions={questions}
              onAddQuestion={onAddQuestion}
              updateQuestionTitle={updateQuestionTitle}
              addOption={addOption}
              updateOption={updateOption}
              deleteOption={deleteOption}
            />
          </>
        ) : (
          <Bulk handleFileUpload={handleFileUpload} file={file} />
        )}

        <Box sx={styleSheet.box}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ width: "20%" }}
          >
            Submit
          </Button>
        </Box>
      </form>
    </div>
  );
};

export default MultipleChoice;
