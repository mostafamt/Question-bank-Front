import React from "react";
import TreeView from "@mui/lab/TreeView";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TreeItem from "@mui/lab/TreeItem";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import { Box, Button, Grid, IconButton, TextField } from "@mui/material";
import { v4 as uuidv4 } from "uuid";

import styles from "./fillBlank.module.scss";
import { useNavigate } from "react-router-dom";
import QuestionForm from "./QuestionForm/QuestionForm";

const styleSheet = {
  treeItem: {
    ".MuiTreeItem-label": {
      fontSize: "1.4rem !important",
      padding: "1rem 0",
    },
  },
  textField: {
    width: "100%",
  },
  button: {
    margin: "2rem 0",
  },
  center: {
    margin: "4rem",
    textAlign: "center",
  },
  objectName: {
    marginBottom: "2rem",
    width: "100%",
  },
};

const generateEmptyQuestion = () => {
  return {
    id: uuidv4(),
    text: "question",
    answer: "",
  };
};

const FillBlank = () => {
  const [data, setData] = React.useState({
    name: "",
    header: "",
    questions: [generateEmptyQuestion()],
  });
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  const clickAddQuestionHandler = () => {
    setData((prevState) => ({
      ...prevState,
      questions: [...prevState.questions, generateEmptyQuestion()],
    }));
  };

  const clickDeleteQuestionHandler = (e, id) => {
    e.stopPropagation();
    if (data.questions.length > 1) {
      const newQuestions = data.questions.filter(
        (question) => question.id !== id
      );
      setData((prevState) => ({ ...prevState, questions: newQuestions }));
    }
  };

  const updateHeaderHanlder = (value) => {
    setData((prevState) => ({ ...prevState, header: value }));
  };

  const editQuestionHandler = (questionId, text) => {
    const newQuestions = data.questions.map((question) => {
      if (question.id === questionId) {
        return {
          ...question,
          text: text,
        };
      }
      return question;
    });
    setData((prevState) => ({ ...prevState, questions: newQuestions }));
  };

  const editAnswerHandler = (questionId, text) => {
    const newQuestions = data.questions.map((question) => {
      if (question.id === questionId) {
        return {
          ...question,
          answer: text,
        };
      }
      return question;
    });
    setData((prevState) => ({ ...prevState, questions: newQuestions }));
  };

  const createObjectHandler = async () => {
    setLoading(true);
    const name = data.name;
    const question_header = data.header;
    const questions = data.questions.map((question) => question.text);
    const answers = data.questions.map((question) => question.answer);

    const body = {
      name,
      question_header,
      questions,
      answers,
    };

    await fetch("http://localhost:5000/fill-space", {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    navigate(`/`);
  };

  const renderTreeItemLabel = (label, id) => {
    return (
      <div className={styles.label}>
        <div>{`Question ${label}`}</div>
        <IconButton
          aria-label="delete"
          size="large"
          onClick={(e) => clickDeleteQuestionHandler(e, id)}
        >
          <DeleteIcon fontSize="inherit" color="error" />
        </IconButton>
      </div>
    );
  };

  return (
    <div className="container">
      <TextField
        label="Object Name"
        value={data.name}
        onChange={(e) =>
          setData((prevState) => ({ ...prevState, name: e.target.value }))
        }
        variant="outlined"
        sx={styleSheet.objectName}
      />
      <TextField
        label="Question Header"
        value={data.header}
        onChange={(e) => updateHeaderHanlder(e.target.value)}
        variant="outlined"
        sx={styleSheet.textField}
      />
      <TreeView
        aria-label="file system navigator"
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
      >
        {data.questions.map((question, idx) => (
          <TreeItem
            key={question.id}
            nodeId={question.id}
            label={renderTreeItemLabel(idx + 1, question.id)}
            sx={styleSheet.treeItem}
          >
            <QuestionForm
              question={question}
              editQuestionHandler={editQuestionHandler}
              editAnswerHandler={editAnswerHandler}
            />
          </TreeItem>
        ))}
        <Button
          variant="contained"
          color="secondary"
          sx={styleSheet.button}
          onClick={clickAddQuestionHandler}
        >
          <AddIcon />
          Add question
        </Button>
      </TreeView>
      <Box sx={styleSheet.center}>
        <Button variant="contained" onClick={createObjectHandler}>
          {loading ? "Loading..." : "Create Object"}
        </Button>
      </Box>
    </div>
  );
};

export default FillBlank;
