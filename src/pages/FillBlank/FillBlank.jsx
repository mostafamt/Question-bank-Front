import React from "react";
import styles from "./fillBlank.module.scss";
import { Button, CircularProgress } from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import QuestionForm from "../../components/FillBlank/QuestionForm/QuestionForm";
import axios from "../../axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useStore } from "../../store/store";
import { toast } from "react-toastify";
import AddIcon from "@mui/icons-material/Add";

const generateFillBlankQuestion = () => {
  return {
    title: "",
    options: [
      { id: uuidv4(), title: "", correct: false, tip: "", showTip: false },
     
    ],
    
  };
};

const FillBlankForm = () => {
  const [parameters, setParameters] = React.useState(
    generateFillBlankQuestion
  );
  const location = useLocation();
  const params = useParams();
  const [showForm, setShowForm] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const { data: state } = useStore();
  const navigate = useNavigate();

  const fetchData = async (id) => {
    const res = await axios.get(`/interactive-objects/${id}`);
    console.log(res.data);
    const { parameters } = res.data;
    setParameters(parameters);
  };

  React.useEffect(() => {
    if (location.pathname !== "/add-question/filltheblanks/manual") {
      const { id } = params;
      fetchData(id);
    }
  }, []);

  const handleEditQuestionParam = (param, value) => {
    setParameters((prevState) => ({ ...prevState, [param]: value }));
  };

  const onClickNew = () => {
    setShowForm(true);
    setParameters(generateFillBlankQuestion());
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
      if (location.pathname !== "/add-question/filltheblanks/manual") {
        const { id } = params;
        await axios.patch(`/interactive-objects/${id}`, {
          ...data,
        });
        toast.success("Question updated successfully!");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        await axios.post("/interactive-objects", data);
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
      <div className={styles.header}>Fill The Blank</div>
      <div className={styles["image-box"]}>
        <img src="/assets/question-bg-2.jpg" alt="question background" />
      </div>
      <QuestionForm
        question={parameters}
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

export default FillBlankForm;
