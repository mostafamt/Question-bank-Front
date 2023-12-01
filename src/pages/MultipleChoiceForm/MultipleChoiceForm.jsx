import React from "react";
import styles from "./multipleChoiceForm.module.scss";
import {
  Box,
  Button,
  CircularProgress,
  Collapse,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
} from "@mui/material";
import { Delete, ExpandLess, ExpandMore } from "@mui/icons-material";
import { grey } from "@mui/material/colors";
import { v4 as uuidv4 } from "uuid";
import QuestionForm from "../../components/MultipleChoice/QuestionForm/QuestionForm";
import axios from "../../axios";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../store/store";
import { toast } from "react-toastify";

const generateMultipleChoiceQuestion = () => {
  return {
    id: uuidv4(),
    open: true,
    type: "multipleChoice",
    params: {
      title: "",
      options: [
        { id: uuidv4(), title: "", correct: false, tip: "", showTip: false },
        { id: uuidv4(), title: "", correct: false, tip: "", showTip: false },
      ],
    },
  };
};

const MultipleChoiceForm = () => {
  const [questions, setQuestions] = React.useState([
    generateMultipleChoiceQuestion(),
  ]);
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const { data: state } = useStore();

  React.useEffect(() => {
    console.log("global state= ", state);
    console.log("status= ", !!Object.keys(state).length);
    // if (!Object.keys(state).length) {
    //   navigate("/add-question");
    // }
  }, []);

  const handleOpenQuestion = (id) => {
    setQuestions((prevState) => {
      return prevState.map((question) => {
        if (question.id === id) {
          question.open = !question.open;
        }
        return question;
      });
    });
  };

  const handleAddQuestion = () => {
    setQuestions((prevState) => [
      ...prevState,
      generateMultipleChoiceQuestion(),
    ]);
  };

  const handleDeleteQuestion = (id) => {
    if (questions.length <= 1) {
      return;
    }
    setQuestions((prevState) => [
      ...prevState.filter((question) => question.id !== id),
    ]);
  };

  const handleEditQuestionParam = (questionId, param, value) => {
    const newQuestions = questions.map((question) => {
      if (question.id === questionId) {
        return {
          ...question,
          params: {
            ...question.params,
            [param]: value,
          },
        };
      }
      return question;
    });
    setQuestions(newQuestions);
  };

  const formatQuestions = (questions) => {
    return questions.map((question) => {
      const { title, options } = question.params;
      const newOptions = options.map((option) => {
        const { title, correct, tip } = option;
        return { title, correct, tip };
      });
      return { title, options: newOptions };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const data = {
      name: state.name,
      domain: state.domain,
      subDomain: state.subDomain,
      objectOwner: state.objectOwner,
      topic: state.topic,
      language: state.language,
      questionType: state.questionType,
      questions: formatQuestions(questions),
    };
    console.log("data= ", data);
    try {
      setLoading(true);
      await axios.post("/multiple-choice", data);
      toast.success("Question created successfully!");

      // setTimeout(() => {
      //   navigate("/");
      // }, 2000);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="container" onSubmit={handleSubmit}>
      <div className={styles.header}>Multiple Choice</div>
      <List
        sx={{ width: "100%", bgcolor: "background.paper" }}
        component="nav"
        aria-labelledby="nested-list-subheader"
      >
        {questions.map((question, idx) => (
          <Box key={question.id} sx={{ mb: 2 }}>
            <Stack direction="row" spacing={2}>
              <ListItemButton
                onClick={() => handleOpenQuestion(question.id)}
                sx={
                  question.open
                    ? { backgroundColor: grey[300] }
                    : { backgroundColor: grey[200] }
                }
              >
                <ListItemText primary={`Question ${idx + 1}`} />
                {question.open ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <IconButton
                aria-label="delete"
                sx={{ width: "3rem", height: "3rem" }}
                color="error"
                onClick={() => handleDeleteQuestion(question.id)}
              >
                <Delete />
              </IconButton>
            </Stack>
            <Collapse
              in={question.open}
              timeout="auto"
              unmountOnExit
              sx={{
                border: `1px solid ${grey[300]}`,
                borderTop: 0,
                mb: 2,
                p: 2,
                borderRadius: "0 0 .5rem .5rem",
                width: "95%",
              }}
            >
              <Box>
                <div className={styles["image-box"]}>
                  <img
                    src="/assets/question-bg-2.jpg"
                    alt="question background"
                  />
                </div>
                <QuestionForm
                  question={question}
                  handleEditQuestionParam={handleEditQuestionParam}
                />
              </Box>
            </Collapse>
          </Box>
        ))}
      </List>
      <Button
        size="large"
        sx={{ fontWeight: "bold" }}
        onClick={handleAddQuestion}
      >
        Add Question
      </Button>
      <div className={styles["submit-box"]}>
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
        >
          <span>Submit</span>
          {loading && <CircularProgress />}
        </Button>
      </div>
    </form>
  );
};

export default MultipleChoiceForm;
