import { Box, Button, Grid } from "@mui/material";
import React from "react";
import QuestionForm from "../QuestionForm/QuestionForm";
import UploadMethods from "../../MultipleChoice/UploadMethods/UploadMethods";
import Bulk from "../../MultipleChoice/Bulk/Bulk";
import { v4 as uuidv4 } from "uuid";
import { generateOption } from "../../../utils";

const owners = [
  { id: "me", value: "me", label: "me" },
  {
    id: "Azharengineering2020",
    value: "azharengineering2020",
    label: "Azharengineering2020",
  },
  { id: "Public", value: "public", label: "Public" },
];

const domains = [
  {
    id: "science",
    label: "Science",
    value: "science",
  },
  {
    id: "test",
    label: "Scube Test Domain",
    value: "test",
  },
  {
    id: "english",
    label: "english",
    value: "english",
  },
];

const defaultData = {
  owner: owners[0].value,
  domain: domains[0].value,
  subDomain: "Test",
};

const questionParams = {
  multipleChoice: {
    title: "Question Title ?",
    options: [generateOption(), generateOption()],
  },
  trueFalse: {
    title: "Question Title ?",
    isCorrect: true,
  },
  fillInTheBlank: {},
};

const generateMultipleChoiceQuestion = () => {
  return {
    id: uuidv4(),
    open: false,
    type: "multipleChoice",
    params: questionParams["multipleChoice"],
  };
};

const AddQuestion = () => {
  const [uploadMethod, setUploadMethod] = React.useState("manual");
  const [file, setFile] = React.useState(null);
  const [data, setData] = React.useState(defaultData);
  const [questions, setQuestions] = React.useState([
    generateMultipleChoiceQuestion(),
  ]);

  const changeUploadMethod = (value) => {
    setUploadMethod(value);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setFile(file);
  };

  const handleEditData = (field, value) => {
    setData((prevState) => ({ ...prevState, [field]: value }));
  };

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

  const handleChangeType = (id, type) => {
    setQuestions((prevState) => {
      return prevState.map((question) => {
        if (question.id === id) {
          question.type = type;
          question.params = questionParams[type];
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

  const handleSubmitForm = (event) => {
    event.preventDefault();
    console.log("data= ", data);
    console.log("questions= ", questions);
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmitForm}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <label htmlFor="owner">Owner</label>
            <select
              name="owner"
              id="owner"
              className="form-control"
              value={data.owner.value}
              onChange={(e) => handleEditData(e.target.name, e.target.value)}
            >
              {owners.map((owner) => (
                <option key={owner.id} value={owner.value}>
                  {owner.label}
                </option>
              ))}
            </select>
          </Grid>

          <Grid item xs={6}>
            <label htmlFor="domain">Domain</label>
            <select
              name="domain"
              id="domain"
              className="form-control"
              value={data.domain.value}
              onChange={(e) => handleEditData(e.target.name, e.target.value)}
            >
              {domains.map((domain) => (
                <option key={domain.id} value={domain.value}>
                  {domain.label}
                </option>
              ))}
            </select>
          </Grid>

          <Grid item xs={6}>
            <label htmlFor="domain">Sub Domain</label>
            <select
              name="subDomain"
              id="subDomain"
              className="form-control"
              value={data.subDomain.value}
              onChange={(e) => handleEditData(e.target.name, e.target.value)}
            >
              <option value="Test">Test</option>
            </select>
          </Grid>
        </Grid>
        <hr />
        <UploadMethods
          uploadMethod={uploadMethod}
          changeUploadMethod={changeUploadMethod}
        />
        {uploadMethod === "manual" ? (
          <QuestionForm
            questions={questions}
            handleOpenQuestion={handleOpenQuestion}
            handleChangeType={handleChangeType}
            handleAddQuestion={handleAddQuestion}
            handleDeleteQuestion={handleDeleteQuestion}
            handleEditQuestionParam={handleEditQuestionParam}
          />
        ) : (
          <Bulk handleFileUpload={handleFileUpload} file={file} />
        )}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            my: 4,
          }}
        >
          <Button
            size="large"
            type="submit"
            variant="contained"
            sx={{
              fontWeight: "bold",
              width: "10rem",
            }}
          >
            Submit
          </Button>
        </Box>
      </form>
    </div>
  );
};

export default AddQuestion;
