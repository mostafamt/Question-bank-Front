import React from "react";
import QuestionForm from "./QuestionForm/QuestionForm";
import TreeView from "@mui/lab/TreeView";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TreeItem from "@mui/lab/TreeItem";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import { Box, Button, IconButton, TextField } from "@mui/material";
import { v4 as uuidv4 } from "uuid";

import styles from "./trueFalse.module.scss";
import { useNavigate, useNavigation } from "react-router-dom";

const styleSheet = {
  treeItem: {
    ".MuiTreeItem-label": {
      fontSize: "1.4rem !important",
      padding: "1rem 0",
    },
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

const generateEmptyAnswer = (id) => {
  return {
    id: uuidv4(),
    text: `answer ${id}`,
    isCorrect: false,
  };
};

const generateEmptyQuestion = () => {
  return {
    id: uuidv4(),
    text: "question",
    answers: [
      {
        id: uuidv4(),
        text: "answer 1",
        isCorrect: true,
      },
    ],
  };
};

const TrueFalse = () => {
  const [name, setName] = React.useState("");
  const [questions, setQuestions] = React.useState([generateEmptyQuestion()]);
  const [answer, setAnswer] = React.useState("true");
  const navigate = useNavigate();

  const clickAddQuestionHandler = () => {
    setQuestions((prevState) => [...prevState, generateEmptyQuestion()]);
  };

  const clickDeleteQuestionHandler = (e, id) => {
    e.stopPropagation();
    if (questions.length > 1) {
      const newQuestions = questions.filter((question) => question.id !== id);
      setQuestions(newQuestions);
    }
  };

  const addAnswerHandler = (id) => {
    const newQuestions = questions.map((question) => {
      if (question.id === id) {
        const newQuestion = {
          ...question,
          answers: [
            ...question.answers,
            generateEmptyAnswer(question.answers.length + 1),
          ],
        };
        return newQuestion;
      }
      return question;
    });

    setQuestions(newQuestions);
  };

  const deleteAnswerHandler = (questionId, answerId) => {
    const newQuestions = questions.map((question) => {
      if (question.id === questionId && question.answers.length > 1) {
        return {
          ...question,
          answers: question.answers.filter((answer) => answer.id !== answerId),
        };
      }
      return question;
    });
    console.log(newQuestions);
    setQuestions(newQuestions);
  };

  const editQuestionHandler = (questionId, text) => {
    const newQuestions = questions.map((question) => {
      if (question.id === questionId) {
        return {
          ...question,
          text: text,
        };
      }
      return question;
    });
    setQuestions(newQuestions);
  };

  const editAnswerHandler = (questionId, answerId, text) => {
    const newQuestions = questions.map((question) => {
      if (question.id === questionId) {
        const newAnswers = question.answers.map((ans) => {
          if (ans.id === answerId) {
            return {
              ...ans,
              text: text,
            };
          }
          return ans;
        });
        return {
          ...question,
          answers: newAnswers,
        };
      }
      return question;
    });
    setQuestions(newQuestions);
  };

  const editWhichCorrectAnswerHandler = (questionId, answerText) => {
    const newQuestions = questions.map((question) => {
      if (question.id === questionId) {
        const newAnswers = question.answers.map((ans) => {
          if (ans.text === answerText) {
            return { ...ans, isCorrect: true };
          }
          return { ...ans, isCorrect: false };
        });
        return {
          ...question,
          answers: newAnswers,
        };
      }
      return question;
    });
    setQuestions(newQuestions);
  };

  const changeAnswer = (value) => {
    setAnswer(value);
  };

  const createObjectHandler = async () => {
    const question = questions[0].text;
    const body = {
      name,
      question,
      answer,
    };
    await fetch("http://localhost:5000/true-false", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

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
        value={name}
        onChange={(e) => setName((prevState) => e.target.value)}
        variant="outlined"
        sx={styleSheet.objectName}
      />
      <TreeView
        aria-label="file system navigator"
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
      >
        {questions.map((question, idx) => (
          <TreeItem
            key={question.id}
            nodeId={question.id}
            label={renderTreeItemLabel(idx + 1, question.id)}
            sx={styleSheet.treeItem}
          >
            <QuestionForm
              question={question}
              addAnswerHandler={addAnswerHandler}
              deleteAnswerHandler={deleteAnswerHandler}
              editQuestionHandler={editQuestionHandler}
              editAnswerHandler={editAnswerHandler}
              editWhichCorrectAnswerHandler={editWhichCorrectAnswerHandler}
              answer={answer}
              changeAnswer={changeAnswer}
            />
          </TreeItem>
        ))}
      </TreeView>
      <Box sx={styleSheet.center}>
        <Button variant="contained" onClick={createObjectHandler}>
          Create Object
        </Button>
      </Box>
    </div>
  );
};

export default TrueFalse;
