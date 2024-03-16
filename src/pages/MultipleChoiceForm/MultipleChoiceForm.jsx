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
import QuestionNameHeader from "../../components/QuestionNameHeader/QuestionNameHeader";

const generateMultipleChoiceQuestion = () => {
  return {
    question: "",
    answers: [
      { id: uuidv4(), title: "", correct: false, tip: "", showTip: false },
      { id: uuidv4(), title: "", correct: false, tip: "", showTip: false },
    ],
  };
};

const MultipleChoiceForm = (props) => {
  const [parameters, setParameters] = React.useState(
    generateMultipleChoiceQuestion
  );
  const [json, setJSON] = React.useState("");
  const location = useLocation();
  const params = useParams();
  const [showForm, setShowForm] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const { data: state } = useStore();
  const navigate = useNavigate();
  const [renderFromModal, setRenderFromModal] = React.useState(false);

  const appendIdToAnswers = (parameters) => {
    const newAnswers = parameters.answers.map((ans) => ({
      ...ans,
      id: uuidv4(),
    }));
    const newParameters = { ...parameters, answers: newAnswers };
    return newParameters;
  };

  const fetchData = async (id) => {
    const res = await axios.get(`/interactive-objects/${id}`);
    console.log(res.data);
    const { parameters } = res.data;
    const newParameters = appendIdToAnswers(parameters);
    setParameters(newParameters);
  };

  React.useEffect(() => {
    // Edit
    if (location.pathname.includes("/edit-question/")) {
      const { id } = params;
      fetchData(id);
    } else {
      if (state.parameters) {
        const keys = Object.keys(state.parameters);
        // OCR
        if (keys.length > 0) {
          setParameters(state.parameters);
          setRenderFromModal(true);
        }
      }
    }
  }, []);

  const handleEditQuestionParam = (param, value) => {
    setParameters((prevState) => ({ ...prevState, [param]: value }));
  };

  const onClickNew = () => {
    setShowForm(true);
    setParameters([generateMultipleChoiceQuestion()]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    console.log(state);
    const data = {
      ...state,
      isAnswered: "g",
      parameters,
    };
    console.log(data);
    try {
      setLoading(true);
      if (location.pathname.includes("/edit-question/")) {
        const { id } = params;
        await axios.patch(`/interactive-objects/${id}`, {
          ...data,
        });
        toast.success("Question updated successfully!");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        await axios.post("/interactive-objects", {
          ...state,
          isAnswered: "g", // g, y , r
          parameters,
        });
        if (props.onSubmit) {
          props.onSubmit();
        } else {
          toast.success("Question created successfully!");
          setTimeout(() => {
            setShowForm(false);
          }, 2000);
        }
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return showForm ? (
    <form className="container" onSubmit={handleSubmit}>
      {!renderFromModal && (
        <>
          <QuestionNameHeader>Multiple Choice</QuestionNameHeader>
          <div className={styles["image-box"]}>
            <img src="/assets/question-bg-2.jpg" alt="question background" />
          </div>
        </>
      )}
      <QuestionForm
        question={parameters}
        handleEditQuestionParam={handleEditQuestionParam}
        renderFromModal={renderFromModal}
      />
      <div>
        <button
          type="button"
          onClick={() => {
            setJSON(parameters);
          }}
        >
          Show JSON
        </button>
        <p>{JSON.stringify(parameters)}</p>
      </div>
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
