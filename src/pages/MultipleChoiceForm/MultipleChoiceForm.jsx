import React from "react";
import styles from "./multipleChoiceForm.module.scss";
import { Button, CircularProgress } from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import QuestionForm from "../../components/MultipleChoice/QuestionForm/QuestionForm";
import axios from "../../axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useStore } from "../../store/store";
import { toast } from "react-toastify";
import AddIcon from "@mui/icons-material/Add";

const generateMultipleChoiceQuestion = () => {
  return {
    title: "",
    options: [
      { id: uuidv4(), title: "", correct: false, tip: "", showTip: false },
      { id: uuidv4(), title: "", correct: false, tip: "", showTip: false },
    ],
  };
};

const MultipleChoiceForm = () => {
  const [questions, setQuestions] = React.useState([
    generateMultipleChoiceQuestion(),
  ]);
  const location = useLocation();
  const params = useParams();
  const [showForm, setShowForm] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const { data: state } = useStore();
  const navigate = useNavigate();

  const fetchData = async (id) => {
    const res = await axios.get(`/question/${id}`);
    console.log(res.data);
    const { question } = res.data;
    setQuestions([
      {
        title: question.title,
        options: question.options.map((option, idx) => ({
          id: uuidv4(),
          title: option.title,
          correct: option.correct,
          tip: option.tip,
          showTip: false,
        })),
      },
    ]);
  };

  React.useEffect(() => {
    console.log(location);
    if (location.pathname !== "/add-question/multiple-choice/manual") {
      const { id } = params;
      fetchData(id);
    }
  }, []);

  const handleEditQuestionParam = (param, value) => {
    setQuestions([{ ...questions[0], [param]: value }]);
  };

  const onClickNew = () => {
    setShowForm(true);
    setQuestions([generateMultipleChoiceQuestion()]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    console.log(state);
    const data = {
      ...state,
      questions: questions.map((question) => {
        const newOptions = question.options.map((option) => {
          delete option.id;
          delete option.showTip;
          return option;
        });
        return { ...question, options: newOptions };
      }),
    };
    console.log(data);
    try {
      setLoading(true);
      if (location.pathname !== "/add-question/multiple-choice/manual") {
        const { id } = params;
        await axios.put(`/question/${id}`, { ...data, question: questions[0] });
        toast.success("Question updated successfully!");
        // setTimeout(() => {
        //   navigate("/");
        // }, 2000);
      } else {
        await axios.post("/question", data);
        toast.success("Question created successfully!");

        setTimeout(() => {
          setShowForm(false);
        }, 2000);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return showForm ? (
    <form className="container" onSubmit={handleSubmit}>
      <div className={styles.header}>Multiple Choice</div>
      <div className={styles["image-box"]}>
        <img src="/assets/question-bg-2.jpg" alt="question background" />
      </div>
      <QuestionForm
        question={questions[0]}
        handleEditQuestionParam={handleEditQuestionParam}
      />
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
  ) : (
    <div className="container">
      <Button
        variant="contained"
        size="large"
        startIcon={<AddIcon />}
        onClick={onClickNew}
      >
        New
      </Button>
    </div>
  );
};

export default MultipleChoiceForm;
